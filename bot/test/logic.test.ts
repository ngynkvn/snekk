import { describe, expect, it } from "@jest/globals";
import { Battlesnake, Coord, GameState, MoveResponse } from "../src/bs-types";
import { basicSnake, bfsPathsToFood } from '../src/heuristic/basic-snake'
import { merge } from "lodash";
import { World } from "../src/heuristic/prelude";
import { log } from "../src/log";

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

        for (let i = 0; i < 2; i++) {
            const moveResponse: MoveResponse = basicSnake(gameState);
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
        const w = World.fromGameState(gameState);
        log.debug('\n' + w.toString())
        const paths = bfsPathsToFood(w, gameState);
        expect(paths.length).toBe(1);
        expect(paths).toEqual([[{ "x": 0, "y": 0 },
        { "x": 1, "y": 0 },
        { "x": 2, "y": 0 },
        { "x": 3, "y": 0 },
        { "x": 4, "y": 0 },
        { "x": 4, "y": 1 },
        { "x": 4, "y": 2 },
        { "x": 4, "y": 3 },
        { "x": 3, "y": 3 },
        { "x": 2, "y": 3 },
        { "x": 1, "y": 3 },
        { "x": 0, "y": 3 },
        { "x": 0, "y": 4 }]]);
        expect(paths[0]).not.toContain(me.body);
    });
});
