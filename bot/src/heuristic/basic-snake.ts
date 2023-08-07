import { Coord, GameState, InfoResponse, MoveResponse } from "../bs-types";
import * as R from 'ramda';
import { log } from "../log";
import { BotAPI } from "../logic";
import { coord, Environment } from "./prelude";

export function basicSnake(gameState: GameState): MoveResponse {
    const world = Environment.fromGameState(gameState);
    const head = gameState.you.head;

    // Step 0: Don't let your Battlesnake move back on it's own neck
    // Step 1 - Don't hit walls.
    // Step 2 - Don't hit yourself.
    // Step 3 - Don't collide with others.
    const safeMoves = new Set<Decision>(world.spanOut(head).map(c => c.direction));

    // Step 4 - Find food.
    // Use information in gameState to seek out and find food.
    let preference: Decision | null = null;
    const foodPaths = bfsPathsToFood(world, gameState);
    if (foodPaths.length > 0) {
        const [shortestPath] = foodPaths.sort((a, b) => a.length - b.length);
        if (shortestPath.length > 0) {
            const [nextMove] = shortestPath;
            preference = getNextMove(head, nextMove);
        }
    }

    // Step 5: Murder?
    let availableKillMove = null;
    const snakes = gameState.board.snakes;
    snakes.forEach((s) => {
        if (gameState.you.id === s.id) {
            return;
        }
        const [enemyHead] = s.body
        // Calculate the possible moves for the enemy
        world.spanOut(enemyHead)
            .filter(possibleEnemyMove => coord.Distance(possibleEnemyMove, head) < 2)
            .forEach(possibleKillMove => {
                const move = getDirTo(possibleKillMove, head)
                // We are able to murder
                if (gameState.you.length > s.length) {
                    availableKillMove = move;
                } else if (safeMoves.size > 1) { // We may get murdered
                    safeMoves.delete(move)
                }
            });
    });

    // Finally, choose a move from the available safe moves.
    let move = Array.from(safeMoves.values())[Math.floor(Math.random() * safeMoves.size)];
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
            const stackTrace = log.error('Invalid set of coordinates were passed.');
            log.error(stackTrace.stack)
            return '' as Decision;
    }
}

export type Decision = "up" | "down" | "left" | "right";
export const DIRECTIONS = ["up", "down", "left", "right"];

/**
 *  Returns a list of all possible moves that can be made from the current game state.
 *  Considers the following rules:
 * - You can't move into a wall.
 * - You can't move into your own body.
 * - You can't move into an enemy's body.
 * @param state
 * @returns Coord[][]
 */
export function bfsPathsToFood(world: Environment, state: GameState): Coord[][] {
    const start = state.you.head;
    const foods = state.board.food;
    const queue: Coord[] = [start];
    const visited: Set<number> = new Set();
    const paths: Map<number, number[]> = new Map();

    while (queue.length > 0) {
        const current = queue.shift()!;
        visited.add(world.i(current));
        const neighbors = world.spanOut(current);
        neighbors.forEach((neighbor) => {
            if (
                !visited.has(world.i(neighbor)) && // Not visited
                !paths.has(world.i(neighbor))      // Not already part of a path
            ) {
                queue.push(neighbor);
                paths.set(world.i(neighbor), [...(paths.get(world.i(current)) || []), world.i(neighbor)]);
            }
        });
    }
    const foodPaths = foods
        .map(world.i.bind(world))
        .map(paths.get.bind(paths))
        .filter((p): p is number[] => {
            return p !== undefined;
        }).map((path) => path.map(world.c.bind(world)));
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