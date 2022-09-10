import { Coord, GameState, InfoResponse, MoveResponse } from "../bs-types";
import { log } from "../log";
import { BotAPI } from "../logic";
import { neighborCoords, StringMap, StringSet, existsIn } from "../types";
import { coord, World } from "./prelude";

export function basicSnake(gameState: GameState): MoveResponse {
    const safeMoves = new Set<Decision>(['up', 'down', 'left', 'right']);
    const world = World.fromGameState(gameState);

    // Step 0: Don't let your Battlesnake move back on it's own neck
    // Step 1 - Don't hit walls.
    // Step 2 - Don't hit yourself.
    // Step 3 - Don't collide with others.
    preventNeckSnap(gameState, safeMoves);
    preventHitWalls(gameState, safeMoves);
    preventHitBody(gameState, safeMoves);
    preventHitEnemy(gameState, safeMoves);

    // Step 4 - Find food.
    // Use information in gameState to seek out and find food.
    const head = gameState.you.head;
    let preference: Decision | null = null;
    const foodPaths = bfsPaths(gameState);
    if (foodPaths.length > 0) {
        const foodPath = foodPaths.sort((a, b) => a.length - b.length)[0];
        if (foodPath.length > 0) {
            const [nextMove] = foodPath;
            preference = getNextMove(head, nextMove);
        }
    }

    // Step 5: Murder?
    const snakes = gameState.board.snakes;
    snakes.forEach((s) => {
        const [enemyHead] = s.body
        // Calculate the possible moves for the enemy
        world.spanOut(enemyHead)
            .filter(possibleEnemyMove => coord.Distance(possibleEnemyMove, head) < 2)
            .forEach(possibleKillMove => {
                // We are able to murder
                if (gameState.you.length > s.length) {
                    const move = getDirTo(possibleKillMove, head)
                    availableKillMove = getDirTo(possibleKillMove, head);
                } else { // We may get murdered
                    safeMoves.delete(getDirTo(possibleKillMove, head))
                }
            });
    });

    // Finally, choose a move from the available safe moves.
    let move = Array.from(safeMoves.values())[Math.floor(Math.random() * safeMoves.size)];
    let availableKillMove = null;
    const response: MoveResponse = {
        move,
    };
    if (preference && safeMoves.has(preference)) {
        response.move = preference;
    }
    const wantToMurder = true;
    // Our snake is murderous.
    if (wantToMurder && availableKillMove) {
        response.move = availableKillMove
    }
    log.info(`MOVE`, {
        id: gameState.game.id,
        turn: gameState.turn,
        move: response.move,
    });
    return response;
}

/**
 * Only works on squares that are 1 block away.
 * @param to 
 * @param from 
 */
export function getDirTo(to: Coord, from: Coord): Decision {
    const { x: aX, y: aY } = to;
    const { x: bX, y: bY } = from;
    const [x, y] = [aX - bX, aY - bY];
    switch (true) {
        case x == -1 && y == 0:
            return 'left'
        case x == 1 && y == 0:
            return 'right'
        case x == 0 && y == 1:
            return 'up'
        case x == 0 && y == -1:
            return 'down'
        default:
            throw `Too far!! dx=${x} dy=${y}`
    }
}

export type Decision = "up" | "down" | "left" | "right";
export const DIRECTIONS = ["up", "down", "left", "right"];

export function preventNeckSnap(
    gameState: GameState,
    possibleMoves: Set<Decision>
): Set<Decision> {
    const [myHead, myNeck] = gameState.you.body;
    possibleMoves.delete(getDirTo(myHead, myNeck));
    return possibleMoves
}
// Use information in gameState to prevent your Battlesnake from moving beyond the boundaries of the board.
export function preventHitWalls(
    gameState: GameState,
    possibleMoves: Set<Decision>
): Set<Decision> {
    const boardWidth = gameState.board.width;
    const boardHeight = gameState.board.height;
    const head = gameState.you.head;
    if (head.x + 1 >= boardWidth) {
        possibleMoves.delete('right');
    }
    if (head.x - 1 < 0) {
        possibleMoves.delete('left');
    }
    if (head.y + 1 >= boardHeight) {
        possibleMoves.delete('up');
    }
    if (head.y - 1 < 0) {
        possibleMoves.delete('down');
    }
    return possibleMoves;
}

// Use information in gameState to prevent your Battlesnake from colliding with itself.
export function preventHitBody(
    gameState: GameState,
    possibleMoves: Set<Decision>
): Set<Decision> {
    const [head, ...body] = gameState.you.body;
    body.filter((bodyPart) => {
        const d = coord.Distance(head, bodyPart);
        return d === 1
    }) // Ignore parts that are >2 blocks away (Manhattan distance)
        // Delete the moves that would collide with our body
        .forEach((bodyPart) => possibleMoves.delete(getDirTo(bodyPart, head)))
    return possibleMoves;
}
// Use information in gameState to prevent your Battlesnake from colliding with others.
export function preventHitEnemy(
    gameState: GameState,
    possibleMoves: Set<Decision>
): Set<Decision> {
    const [head] = gameState.you.body;
    const snakes = gameState.board.snakes;
    snakes.forEach((s) => {
        s.body
            .filter((bodyPart) => {
                const d = coord.Distance(head, bodyPart);
                return d === 1
            })
            // Delete the moves that would collide with our body
            .forEach((part) => possibleMoves.delete(getDirTo(part, head)))

    });
    return possibleMoves;
}

/**
 *  Returns a list of all possible moves that can be made from the current game state.
 *  Considers the following rules:
 * - You can't move into a wall.
 * - You can't move into your own body.
 * - You can't move into an enemy's body.
 * @param state
 * @returns Coord[][]
 */
export function bfsPaths(state: GameState): Coord[][] {
    const start = state.you.head;
    const foods = state.board.food;
    const queue: Coord[] = [start];
    const visited: StringSet<Coord> = new StringSet();
    const paths: StringMap<Coord, Coord[]> = new StringMap();

    while (queue.length > 0) {
        const current = queue.shift()!;
        visited.add(current);
        const neighbors = neighborCoords(current);
        neighbors.forEach((neighbor) => {
            if (
                neighbor.x >= 0 &&
                neighbor.x < state.board.width &&
                neighbor.y >= 0 &&
                neighbor.y < state.board.height &&
                !visited.has(neighbor) && // Not visited
                !paths.has(neighbor) && // Not in a path
                !existsIn(neighbor, state.you.body) && // Not in your body
                !state.board.snakes.some((s) =>
                    existsIn(neighbor, s.body)
                ) // Not in an enemy's body
            ) {
                queue.push(neighbor);
                paths.set(neighbor, [...(paths.get(current) || []), neighbor]);
            }
        });
    }
    const foodPaths = foods
        .map(paths.get.bind(paths))
        .filter((p): p is Coord[] => {
            return p !== undefined;
        });
    return foodPaths;
}


export function getNextMove(head: Coord, nextMove: Coord): Decision | null {
    const x = head.x - nextMove.x;
    const y = head.y - nextMove.y;
    if (x == 1) {
        return "left";
    } else if (x == -1) {
        return "right";
    } else if (y == 1) {
        return "down";
    } else if (y == -1) {
        return "up";
    } else {
        return null;
    }
}

function info(): InfoResponse {
    const response: InfoResponse = {
        apiversion: "1",
        author: "Kevin Nguyen",
        color: "#99F7AB",
        head: "default",
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
        move: basicSnake,
    }
}