import { World } from "./prelude";
import { t } from "./test.util";

describe('prelude', () => {

    test('coordinate functions', () => {
        // GIVEN 
        const [width, height] = [10, 10];

        // WHEN
        const map = new World(width, height)
        const i = map.i.bind(map)
        const c = map.c.bind(map)

        // THEN
        expect(i({ x: 0, y: 0 })).toBe(0)
        expect(c(0)).toEqual({ x: 0, y: 0 })
        expect(i(c(0))).toEqual(0)
        expect(c(i({ x: 0, y: 0 }))).toEqual({ x: 0, y: 0 })

        expect(i({ x: 9, y: 9 })).toBe(width * height - 1)
        expect(c(width * height - 1)).toEqual({ x: 9, y: 9 })
        expect(i(c(width * height - 1))).toEqual(width * height - 1)
        expect(c(i({ x: 9, y: 9 }))).toEqual({ x: 9, y: 9 })
    })

    test('toString', () => {
        const map = new World(3, 1);
        map.mark('1')({ x: 0, y: 0 })
        expect(map.toString()).toBe(`1SS`)
        map.mark('1')({ x: 1, y: 0 })
        expect(map.toString()).toBe(`11S`)
        map.mark('1')({ x: 2, y: 0 })
        expect(map.toString()).toBe(`111`)
    })
    test('toString2', () => {
        const map = new World(3, 3);
        // Trimming function
        const t = (s: string) => s.split('\n').map(s => s.trim()).filter(Boolean).join('\n')
        map.mark('1')({ x: 0, y: 0 })
        expect(map.toString()).toBe(t(`SSS
                                       SSS
                                       1SS`))
        map.mark('1')({ x: 1, y: 1 })
        expect(map.toString()).toBe(t(`SSS
                                       S1S
                                       1SS`))
        map.mark('1')({ x: 2, y: 2 })
        expect(map.toString()).toBe(t(`SS1
                                       S1S
                                       1SS`))
    })
    test('toString2', () => {
        const map = new World(3, 3);
        // Trimming function
        const cfg = { snakes: ["🐍"], hazard: "0", safe: "🔵" };

        // Sometimes I ask myself why I do the things I do
        map.mark('11')({ x: 0, y: 0 })
        expect(map.toEmojiString(cfg)).toBe(t(`
        🔵🔵🔵
        🔵🔵🔵
        🐍🔵🔵
        `))
        map.mark('11')({ x: 1, y: 1 })
        expect(map.toEmojiString(cfg)).toBe(t(`
        🔵🔵🔵
        🔵🐍🔵
        🐍🔵🔵
        `))
        map.mark('11')({ x: 2, y: 2 })
        expect(map.toEmojiString(cfg)).toBe(t(`
        🔵🔵🐍
        🔵🐍🔵
        🐍🔵🔵
        `))
    })
})