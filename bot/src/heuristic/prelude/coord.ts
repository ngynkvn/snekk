import R from "ramda";
import { Coord } from "../../bs-types";

export type Decision = 'up' | 'down' | 'left' | 'right';

export interface CoordFn {
    /**
     * The origin. Conventionally, (x:0, y:0)
     */
    Origin: Coord,
    /**
     * a == b, if a.x == b.x and a.y == b.y.
     */
    Equals: (a: Coord, b: Coord) => boolean;
    /**
     * Returns Manhattan distance between two points
     */
    Distance: (a: Coord, b: Coord) => number,
    Includes: (a: Coord, cs: Coord[]) => boolean;
    /**
     * Returns possible new coordinates assuming the given direction is taken.
     * @param a Coord
     * @returns 
     */
    Sprawl: (a: Coord) => (Coord & { direction: Decision })[];
    Towards: (to: Coord, from: Coord) => Coord;
    /**
     * `Length(to) == Distance(to, origin)`
     */
    Length: (to: Coord) => number;
    toString: (c: Coord) => string;
    from: (x: number, y: number) => Coord;
}

export const coord: CoordFn = {
    Origin: { x: 0, y: 0 },
    Equals: (a, b) => a.x == b.x && a.y == b.y,
    Distance: (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y),
    Includes: (a, cs) => cs.some(R.partial(coord.Equals, [a])),
    Sprawl: (a) => ([
        { x: a.x + 1, y: a.y, direction: 'right' },
        { x: a.x - 1, y: a.y, direction: 'left' },
        { y: a.y + 1, x: a.x, direction: 'up' },
        { y: a.y - 1, x: a.x, direction: 'down' },
    ]),
    Towards: (to, from) => {
        return { x: to.x - from.x, y: to.y - from.y, }
    },
    // Length(a) == Distance(a, Origin) == Distance(Origin, a)
    Length: (to) => {
        return Math.abs(to.x) + Math.abs(to.y)
    },
    toString: ({ x, y }) => {
        return `(${x}, ${y})`;
    },
    from: (x, y) => ({ x, y })
}