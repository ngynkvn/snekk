import { describe, expect, it } from "@jest/globals";
import { info, move } from "../src/logic";
import { Battlesnake, Coord, GameState, MoveResponse } from "../src/bs-types";
import { bfsPaths } from '../src/heuristic/basicSnake'
import { merge } from "lodash";

type Config = {
    [key in keyof GameState]?: Partial<GameState[key]>;
};
function createGameState(me: Battlesnake, state: Config): GameState {
    const gameState = {
        game: {
            id: "",
            source: "",
            ruleset: {
                name: "",
                version: "",
                settings: {
                    foodSpawnChance: 15,
                    minimumFood: 1,
                    hazardDamagePerTurn: 14,
                    royale: { shrinkEveryNTurns: 0 },
                    squad: {
                        allowBodyCollisions: false,
                        sharedElimination: false,
                        sharedHealth: false,
                        sharedLength: false,
                    },
                },
            },
            timeout: 0,
        },
        turn: 0,
        board: {
            height: 10,
            width: 10,
            food: [],
            snakes: [me],
            hazards: [],
        },
        you: me,
    };
    return merge(gameState, state);
}

function createBattlesnake(id: string, body: Coord[]): Battlesnake {
    return {
        id: id,
        name: id,
        health: 0,
        body: body,
        latency: "",
        head: body[0],
        length: body.length,
        shout: "",
        squad: "",
    };
}

describe("Battlesnake API Version", () => {
    it("should be api version 1", () => {
        const result = info();
        expect(result.apiversion).toBe("1");
    });
});

describe("Battlesnake Moves", () => {
    it("should never move into its own neck", () => {
        // Arrange
        const me = createBattlesnake("me", [
            { x: 2, y: 0 },
            { x: 1, y: 0 },
            { x: 0, y: 0 },
        ]);
        const gameState = createGameState(me, {
            board: { width: 3, height: 3 },
        });

        // Act 1,000x (this isn't a great way to test, but it's okay for starting out)
        for (let i = 0; i < 1000; i++) {
            const moveResponse: MoveResponse = move(gameState);
            // In this state, we should NEVER move left.
            const allowedMoves = ["up", "down", "right"];
            expect(allowedMoves).toContain(moveResponse.move);
        }
    });
});

describe("Battlesnake Food Search", () => {
    it("Should avoid self during food search", () => {
        // Arrange
        const me = createBattlesnake("me", [
            { x: 0, y: 1 },
            { x: 1, y: 1 },
            { x: 2, y: 1 },
            { x: 3, y: 1 },
            { x: 3, y: 2 },
            { x: 2, y: 2 },
            { x: 1, y: 2 },
            { x: 0, y: 2 },
        ]);
        const food: Coord = { x: 0, y: 4 };
        const gameState = createGameState(me, {
            board: { width: 5, height: 5, food: [food] },
        });
        const paths = bfsPaths(gameState);
        expect(paths.length).toBe(1);
        expect(paths[0]).not.toContain(me.body);
    });
});
