import { InfoResponse, GameState, MoveResponse } from "./bs-types";
import { log } from "./log";
import { floodFill } from "./heuristic/flood-fill";

export function info(): InfoResponse {
    const response: InfoResponse = {
        apiversion: "1",
        author: "Kevin Nguyen",
        color: "#2a3b57",
        head: "all-seeing",
        tail: "default",
    };
    log.info("INFO", { response });
    return response;
}

export function start(gameState: GameState): void {
    log.info(`START`, { id: gameState.game.id });
}

export function end(gameState: GameState): void {
    log.info(`END`, { id: gameState.game.id });
}

export function move(gameState: GameState): MoveResponse {
    const move = floodFill(gameState);
    return { move }
}