import { calcFill } from "../flood-fill"
import { Environment } from "../prelude"

describe('flood fill', () => {
    test('calc_fill fills empty', () => {
        // GIVEN
        const world = new Environment(10, 10)

        // WHEN
        const count = calcFill(world, { x: 0, y: 0 });

        // THEN
        expect(count.size).toBe(100);
    })
    test('calc_fill returns expected values', () => {
        const m = 'SDSS' +
            'DDSS' +
            'SSSD' +
            'SSDD';
        const world = Environment.fromString(4, 4, m)
        const seen = new Set<number>();
        // Keep in mind the fill string is upside down when fed in
        expect(calcFill(world, { x: 0, y: 0 }).size).toBe(1)
        expect(calcFill(world, { x: 3, y: 0 }).size).toBe(9)
    })
})