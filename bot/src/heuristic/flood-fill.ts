import { GameState, Coord, Battlesnake } from "../bs-types";
import { log } from "../log";
import { move } from "../logic";
import { Decision, CellType, World } from "./prelude";

/**
 * 
 * @param gameState The gamestate object received from Battlesnakes.
 * @returns a Decision, 'up', 'down', 'left', 'right'
 */
export function floodFill(gameState: GameState): Decision {
    // Inputs from GameState
    const { you, board: { snakes, hazards } } = gameState;
    const { width, height } = gameState.board;
    const map = new World(width, height);

    // Mark deadly locations
    [...you.body, ...snakes.flatMap(s => s.body), ...hazards].forEach(map.mark('D'))

    const spread = map.spanOut(you.head);
    // Count number of safe tiles after a move, for each direction.
    const moves: [string, number][] = spread.map(m => {
        return [m.dir, calcFill(map, m).size]
    })
    if(moves.length === 0) {
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
        log.fatal(new Error('Decision could not be made!: ' + map.toString()))
    }

    return decision as Decision;
}

export function calcFill(map: World, move: Coord, visitedTiles: Set<number> = new Set()): Set<number> {
    if (visitedTiles.has(map.i(move))) {
        return visitedTiles;
    }
    visitedTiles.add(map.i(move))
    map.spanOut(move).forEach(nextMove => {
        calcFill(map, nextMove, visitedTiles);
    })
    return visitedTiles
}

function markDeadly(map: World, ...coords: Coord[]): World {
    coords.forEach(map.mark('D'));
    return map
}