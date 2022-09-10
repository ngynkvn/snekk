import { Coord, GameState } from "../bs-types";
import { basicSnake, getDirTo } from "./basic-snake";
import { World } from "./prelude";

describe('getDirTo', () => {
    it('returns the dirs I expect', () => {
        expect(getDirTo({ x: 0, y: 1 }, { x: 0, y: 0 })).toBe('up')
        expect(getDirTo({ x: 0, y: -1 }, { x: 0, y: 0 })).toBe('down')
        expect(getDirTo({ x: 0, y: 0 }, { x: 1, y: 0 })).toBe('left')
        expect(getDirTo({ x: 0, y: 0 }, { x: -1, y: 0 })).toBe('right')
    });
    it('doesnt die chasing head', () => {
        const me = {
            head: { x: 3, y: 1 },
            body: [{ x: 3, y: 1 }, { x: 2, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 0 }],
        }
        const homie = {
            head: { x: 5, y: 1 },
            body: [{ x: 5, y: 1 }, { x: 4, y: 1 }, { x: 4, y: 0 }],
        }
        const gameState = {
            game: {},
            you: me,
            board: {
                width: 6,
                height: 2,
                food: [] as Coord[],
                snakes: [
                    me,
                    homie,
                ]
            },
            turn: {}
        } as GameState;
        expect(basicSnake(gameState).move).toBe('down')
    })
})