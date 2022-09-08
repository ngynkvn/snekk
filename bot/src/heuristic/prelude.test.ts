import { World } from "./prelude";

describe('prelude', () => {

    test('coordinate functions', () => {
        // GIVEN 
        const [width, height] = [10, 10];

        // WHEN
        const map = new World(width, height)
        const i = map.i.bind(map)
        const c = map.c.bind(map)

        // THEN
        expect(i({x: 0, y: 0})).toBe(0)
        expect(c(0)).toEqual({x: 0, y: 0})
        expect(i(c(0))).toEqual(0)
        expect(c(i({x: 0, y: 0}))).toEqual({x: 0, y:0})

        expect(i({x: 9, y: 9})).toBe(width*height - 1)
        expect(c(width*height - 1)).toEqual({x: 9, y: 9})
        expect(i(c(width*height - 1))).toEqual(width*height - 1)
        expect(c(i({x: 9, y: 9}))).toEqual({x: 9, y: 9})
    })
})