import { Coord, GameState, MoveResponse } from "../bs-types";
import { log } from "../log";
import { neighborCoords, StringMap, StringSet, existsIn } from "../types";

export function basicSnake(gameState: GameState): MoveResponse {
    const possibleMoves = allMoves();

    // Step 0: Don't let your Battlesnake move back on it's own neck
    // Step 1 - Don't hit walls.
    // Step 2 - Don't hit yourself.
    // Step 3 - Don't collide with others.
    preventNeckSnap(gameState, possibleMoves);
    preventHitWalls(gameState, possibleMoves);
    preventHitBody(gameState, possibleMoves);
    preventHitEnemy(gameState, possibleMoves);

    // Step 4 - Find food.
    // Use information in gameState to seek out and find food.
    const head = gameState.you.head;
    let preference: Direction | null = null;
    const foodPaths = bfsPaths(gameState);
    if (foodPaths.length > 0) {
        const foodPath = foodPaths.sort((a, b) => a.length - b.length)[0];
        if (foodPath.length > 0) {
            const [nextMove] = foodPath;
            preference = getNextMove(head, nextMove);
        }
    }

    // Finally, choose a move from the available safe moves.
    const safeMoves = DIRECTIONS.filter(
        (key) => possibleMoves[key as Direction]
    );
    let move = safeMoves[Math.floor(Math.random() * safeMoves.length)];
    const response: MoveResponse = {
        move,
    };
    if (preference && safeMoves.includes(preference)) {
        response.move = preference;
    }
    log.info(`MOVE`, {
        id: gameState.game.id,
        turn: gameState.turn,
        move: response.move,
    });
    return response;
}

export type Direction = "up" | "down" | "left" | "right";
export type PossibleMoves = {
    [key in Direction]: boolean;
};
export const DIRECTIONS = ["up", "down", "left", "right"];
export function allMoves(): PossibleMoves {
    return {
        up: true,
        down: true,
        left: true,
        right: true,
    };
}

/**
 * Checks where `a` will hit `b` for all cardinals.
 */
function preventHit(a: Coord, b: Coord): PossibleMoves {
    const preventHit: PossibleMoves = allMoves();
    if (a.x == b.x) {
        if (a.y + 1 == b.y) {
            preventHit.up = false;
        } else if (a.y - 1 == b.y) {
            preventHit.down = false;
        }
    } else if (a.y == b.y) {
        if (a.x + 1 == b.x) {
            preventHit.right = false;
        } else if (a.x - 1 == b.x) {
            preventHit.left = false;
        }
    }
    return preventHit;
}

// Copy moves from b to a
function squishMoves(a: PossibleMoves, b: PossibleMoves): PossibleMoves {
    a.up = a.up && b.up;
    a.down = a.down && b.down;
    a.left = a.left && b.left;
    a.right = a.right && b.right;
    return a;
}

export function preventNeckSnap(
    gameState: GameState,
    possibleMoves: PossibleMoves
): PossibleMoves {
    const [myHead, myNeck] = gameState.you.body;
    return squishMoves(possibleMoves, preventHit(myHead, myNeck));
}
// Use information in gameState to prevent your Battlesnake from moving beyond the boundaries of the board.
export function preventHitWalls(
    gameState: GameState,
    possibleMoves: PossibleMoves
): PossibleMoves {
    const boardWidth = gameState.board.width;
    const boardHeight = gameState.board.height;
    const head = gameState.you.head;
    if (head.x + 1 >= boardWidth) {
        possibleMoves.right = false;
    }
    if (head.x - 1 < 0) {
        possibleMoves.left = false;
    }
    if (head.y + 1 >= boardHeight) {
        possibleMoves.up = false;
    }
    if (head.y - 1 < 0) {
        possibleMoves.down = false;
    }
    return possibleMoves;
}

// Use information in gameState to prevent your Battlesnake from colliding with itself.
export function preventHitBody(
    gameState: GameState,
    possibleMoves: PossibleMoves
): PossibleMoves {
    const [head, ...body] = gameState.you.body;
    body.filter((b) => Math.abs(b.x - head.x) + Math.abs(b.y - head.y) < 2) // Ignore parts that are >2 blocks away (Manhattan distance)
        // Map the parts close by to a possible moves object
        .map((part) => preventHit(head, part))
        // Squish the possible moves together.
        .reduce(squishMoves, possibleMoves);
    return possibleMoves;
}
// Use information in gameState to prevent your Battlesnake from colliding with others.
export function preventHitEnemy(
    gameState: GameState,
    possibleMoves: PossibleMoves
): PossibleMoves {
    const [head] = gameState.you.body;
    const snakes = gameState.board.snakes;
    snakes.forEach((s) => {
        s.body
            .filter((b) => Math.abs(b.x - head.x) + Math.abs(b.y - head.y) < 2)
            // Map the parts close by to a possible moves object
            .map((part) => preventHit(head, part))
            // Squish the possible moves together.
            .reduce(squishMoves, possibleMoves);
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
        .filter((p: Coord[] | undefined) => p !== undefined);
    return foodPaths as Coord[][];
}


export function getNextMove(head: Coord, nextMove: Coord): Direction | null {
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