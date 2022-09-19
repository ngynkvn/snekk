import express, { Request, Response, Router } from "express";

import { BotAPI } from "./logic";
import { log } from "./log";
import { GameState, InfoResponse, MoveResponse } from "./bs-types";
import basicSnake from "./heuristic/basic-snake";
import floodFill from './heuristic/flood-fill';
import { createClient } from 'redis';

const app = express();
app.use(express.json());
app.use(function (req, res, next) {
    res.set("Server", "BattlesnakeOfficial/starter-snake-typescript");
    next();
});

const port = process.env.PORT || 8080;

const redis = createClient();
redis.on('error', (err) => console.log('Redis Client Error', err));
redis.connect().then(PerformConnectionTest, () => log.fatal(new Error('REDIS_FAILURE')));

async function recordRedisEvent(gameState: GameState) {
    const result = await redis.multi()
    .set(`gameState:${gameState.game.id}:turnCount`, gameState.turn)
    .json.set(`gameState:${gameState.game.id}`, '$', [], {NX: true})
    .json.arrAppend(`gameState:${gameState.game.id}`, '$', gameState, {XX: true})
    .exec()
}

async function PerformConnectionTest() {
    log.debug("Redis connected");
    log.debug(await redis.set('__ONLINE', 'TRUE'));
    log.debug(await redis.get('__ONLINE'));
}

const makeRouter = (bAPI: BotAPI): Router => {
    const router = express.Router()
    type GameStateRequest = Request<{}, {}, GameState>;
    router.use((currGameState: GameStateRequest, res: Response, next) => {
        // Log path
        log.info(currGameState.path, currGameState.body?.game?.id)
        next()
    })
    router.get("/", (req: Request<{}, {}, {}>, res: Response) => {
        redis.incrBy(`${bAPI.name}`, 1)
        res.send(bAPI.info());
    });
    router.post('/start', (currGameState: GameStateRequest, res: Response) => {
        redis.set(`${bAPI.name}:${currGameState.body.game.id}:status`, 'START');
        log.info(`Rules:`, currGameState.body.game)
        res.send(bAPI.start(currGameState.body))
    })
    router.post("/move", (req: Request<{}, {}, GameState>, res: Response) => {
        const move = bAPI.move(req.body);
        recordRedisEvent(req.body)
        log.info(`Decision:`, move)
        res.send(bAPI.move(req.body));
    });

    router.post("/end", (req: Request<{}, {}, GameState>, res: Response) => {
        redis.set(`${bAPI.name}:${req.body.game.id}:status`, 'END');
        log.info(`Final State of the game:`, req.body.board)
        res.send(bAPI.end(req.body));
    });
    return router
};

app.use("/", makeRouter(basicSnake()))
app.use("/basic", makeRouter(basicSnake()))


// Start the Express server
app.listen(port, () => {
    log.silly(`Hey Kev!`);
    log.info(`Starting Battlesnake Server at http://0.0.0.0:${port}...`);
});
