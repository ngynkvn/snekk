import express, { Request, Response, Router } from "express";

import { BotAPI } from "./logic";
import { log } from "./log";
import { GameState, InfoResponse, MoveResponse } from "./bs-types";
import basicSnake from "./heuristic/basic-snake";
import floodFill from './heuristic/flood-fill';

const app = express();
app.use(express.json());
app.use(function (req, res, next) {
    res.set("Server", "BattlesnakeOfficial/starter-snake-typescript");
    next();
});

const port = process.env.PORT || 8080;


const makeRouter = (bAPI: BotAPI): Router => {
    const router = express.Router()
    type GameStateRequest = Request<{}, {}, GameState>;
    router.use((currGameState: GameStateRequest, res: Response, next) => {
        // Log path
        log.info(currGameState.path, currGameState.body.game.id)
        next()
    })
    app.get("/", (req: Request<{}, {}, {}>, res: Response) => {
        res.send(bAPI.info());
    });
    router.post('/start', (currGameState: GameStateRequest, res: Response) => {
        log.info(`Rules:`, currGameState.body.game)
        res.send(bAPI.start(currGameState.body))
    })
    router.post("/move", (req: Request<{}, {}, GameState>, res: Response) => {
        const move = bAPI.move(req.body);
        log.info(`Decision:`, move)
        res.send(bAPI.move(req.body));
    });

    router.post("/end", (req: Request<{}, {}, GameState>, res: Response) => {
        log.info(`Final State of the game:`, req.body.board)
        res.send(bAPI.end(req.body));
    });
    return router
};

app.use("/", makeRouter(floodFill()))
app.use("/basic", makeRouter(basicSnake()))


// Start the Express server
app.listen(port, () => {
    log.silly(`Hey Kev!`);
    log.info(`Starting Battlesnake Server at http://0.0.0.0:${port}...`);
});
