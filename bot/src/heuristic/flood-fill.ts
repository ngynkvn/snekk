import { GameState, Coord, Battlesnake, InfoResponse, MoveResponse } from "../bs-types";
import { log } from "../log";
import { BotAPI } from "../logic";
import { Decision, CellType, Environment } from "./prelude";

/**
 * 
 * @param gameState The gamestate object received from Battlesnakes.
 * @returns a Decision, 'up', 'down', 'left', 'right'
 */
export function floodFill(gameState: GameState): { move: string } {
    // Inputs from GameState
    const { you, board: { snakes, hazards } } = gameState;
    const { width, height } = gameState.board;
    const map = new Environment(width, height);

    // Mark deadly locations
    [...you.body, ...snakes.flatMap(s => s.body), ...hazards].forEach(map.mark('D'))

    const spread = map.spanOut(you.head);
    // Count number of safe tiles after a move, for each direction.
    const moves: [string, number][] = spread.map(m => {
        return [m.direction, calcFill(map, m).size]
    })
    if (moves.length === 0) {
        log.fatal(new Error('Rest In Peace.'))
    }

    // Pick the best move
    const [decision, _] = moves.reduce(([prevDir, prevTileCount], [currDir, currTileCount]) => {
        if (currTileCount > prevTileCount) {
            return [currDir, currTileCount];
        }
        return [prevDir, prevTileCount];
    }, ['nil', -1])

    if (decision === 'nil') {
        log.fatal(new Error('Decision could not be made!:\n' + map.toString() + `\n${gameState}`))
    }

    return { move: decision };
}

export function calcFill(map: Environment, move: Coord, visitedTiles: Set<number> = new Set()): Set<number> {
    if (visitedTiles.has(map.i(move))) {
        return visitedTiles;
    }
    visitedTiles.add(map.i(move))
    map.spanOut(move).forEach(nextMove => {
        calcFill(map, nextMove, visitedTiles);
    })
    return visitedTiles
}

function info(): InfoResponse {
    const response: InfoResponse = {
        apiversion: "1",
        author: "Kevin Nguyen",
        color: "#42253B",
        head: "beluga",
        tail: "default",
    };
    return response;
}
function start(gameState: GameState): void { }
function end(gameState: GameState): void { }

export default function api(): BotAPI {
    return {
        info,
        start,
        end,
        move: floodFill,
    }
}