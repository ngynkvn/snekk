import express, { Request, Response } from "express";

import { info, start, move, end } from "./logic";
import { log } from "./log";
import { db } from "./db";
import { GameState } from "./bs-types";

const app = express();
app.use(express.json());
app.use(function (req, res, next) {
    res.set("Server", "BattlesnakeOfficial/starter-snake-typescript");
    next();
});

const port = process.env.PORT || 8080;

app.get("/", (req: Request<{}, {}, {}>, res: Response) => {
    res.send(info());
});

app.post("/start", (req: Request<{}, {}, GameState>, res: Response) => {
    log.info("START", req.body.game.id)
    const session = db.prepare(`
        INSERT INTO session(sid)
        VALUES (?)`)
    const event = db.prepare(`
    INSERT INTO event(type, route, session_id)
    VALUES ('start',?,?)`)
    db.transaction(() => {
        session.run(req.body.game.id);
        event.run(req.url, req.body.game.id);
    })()
    res.send(start(req.body));
});

app.post("/move", (req: Request<{}, {}, GameState>, res: Response) => {
    log.info("MOVE")
    log.info("m",req.body.game.id)
    log.info(db.prepare(`
    INSERT INTO event(type, route, session_id)
    VALUES ('move',?,?)`).run(req.url, req.body.game.id))
    res.send(move(req.body));
});

app.post("/end", (req: Request<{}, {}, GameState>, res: Response) => {
    log.info(db.prepare(`
    INSERT INTO event(type, route, session_id)
    VALUES ('end',?,?)`).run(req.url, req.body.game.id))
    res.send(end(req.body));
});

// Start the Express server
app.listen(port, () => {
    log.silly(`Hey Kev!`);
    log.info(`Starting Battlesnake Server at http://0.0.0.0:${port}...`);
});
