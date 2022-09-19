import { InfoResponse, GameState, MoveResponse } from "./bs-types";

export type BotAPI = {
    name: string
    // Route 
    info: (gameState?: GameState) => InfoResponse
    start: (gameState: GameState) => void
    move: (gameState: GameState) => MoveResponse
    end: (gameState: GameState) => void
}
