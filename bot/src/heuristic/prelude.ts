import { Coord, GameState } from "../bs-types";
import * as R from 'ramda';

export type Decision = 'up' | 'down' | 'left' | 'right';
export type Point = [number, number];
export type Safe = 'S';
export type Death = 'D';
export type Food = 'F';
export type Outside = 'O';
export type Player = string;
export type CellType = Safe | Death | Player | Outside | Food;
export type Map = CellType[];

export type IconSet = {
    snakes: string[]
    safe: string
    hazard: string
}

export class Environment {
    map: Array<CellType>;
    // Dimensions
    width: number
    height: number
    // Boundaries
    max: { x: number, y: number };
    min: { x: number, y: number };

    raw?: GameState;

    constructor(width: number, height: number, raw?: GameState) {
        this.map = Array.from(Array(width * height)).map(_ => 'S');
        this.max = { x: width - 1, y: height - 1 };
        this.min = { x: 0, y: 0 };
        this.width = width
        this.height = height
        this.raw = raw
    }

    static fromString(width: number, height: number, str: string): Environment {
        const w = new Environment(width, height);
        const arr = str.split('');
        if (arr.length !== w.map.length) {
            throw 'String length mismatched'
        }
        w.map = arr as Array<CellType>;
        return w
    }

    static fromGameState(gameState: GameState): Environment {
        const w = new Environment(gameState.board.width, gameState.board.height, gameState)
        gameState.board.food.forEach(w.mark('F').bind(w))
        gameState.board.snakes.forEach(s => s.body.forEach(w.mark(s.id)))
        return w
    }

    static DEFAULT_SNAKE_ICONS = ["🥸", "🎃", "👽", "🌕", "🌑", "🍪"];

    static DEFAULT_ENV_ICONS: IconSet = { snakes: Environment.DEFAULT_SNAKE_ICONS, hazard: "🟥", safe: "⬜️" };

    toEmojiString({ snakes, hazard, safe } = Environment.DEFAULT_ENV_ICONS): string {
        const snakeMap: Record<string, string> = {};
        let i = 0;
        return this.map.reduce((prev: string[][], curr) => {
            if (curr.length > 1) { // Player 
                if (!snakeMap[curr]) {
                    snakeMap[curr] = snakes[i];
                    i++;
                }
                curr = snakeMap[curr];
            } else if (curr === 'S') {
                curr = safe
            } else if (curr === 'D') {
                curr = hazard
            } else if (curr === 'F') {
                curr = hazard
            }

            if (prev[prev.length - 1].length < this.width) {
                prev[prev.length - 1].push(curr);
                return prev;
            } else {
                prev.push([curr]);
                return prev
            }
        }, [[]]).reverse()
            .map(a => a.join(''))
            .join('\n')
    }
    toString(): string {
        return this.map.reduce((prev: string[][], curr) => {
            if (curr.length > 1) { // Player 
                curr = '#';
            }
            if (prev[prev.length - 1].length < this.width) {
                prev[prev.length - 1].push(curr);
                return prev;
            } else {
                prev.push([curr]);
                return prev
            }
        }, [[]]).reverse()
            .map((a) => a.join(``))
            .join('\n')
    }

    i(c: Coord): number {
        return c.x + c.y * this.width
    };
    c(i: number): Coord {
        return { x: i % this.width, y: Math.floor(i / this.width) }
    };

    check(c: Coord): CellType {
        if (this.inBounds(c)) {
            return this.map[this.i(c)]
        } else {
            return 'O';
        }
    }
    mark(type: CellType): (c: Coord) => void {
        return (c: Coord) => this.map[this.i(c)] = type;
    };
    inBounds({ x, y }: Coord): boolean {
        return (0 <= x && x < this.width) && (0 <= y && y < this.height)
    };
    isSafe(c: Coord): boolean {
        const spot = this.map[this.i(c)]
        return this.inBounds(c) && (spot == 'S' || spot == 'F')
    };
    spanOut(c: Coord): (Coord & { direction: Decision })[] {
        return coord.Sprawl(c).filter(this.isSafe.bind(this))
    };
}

type CoordFn = {
    Origin: Coord,
    Equals: (a: Coord, b: Coord) => boolean;
    // Manhattan distance
    Distance: (a: Coord, b: Coord) => number,
    Includes: (a: Coord, cs: Coord[]) => boolean;
    /**
     * Returns possible new coordinates assuming the given direction is taken.
     * @param a Coord
     * @returns 
     */
    Sprawl: (a: Coord) => (Coord & { direction: Decision })[];
    Towards: (to: Coord, from: Coord) => Coord;
    // Length(to) == Distance(to, origin)
    Length: (to: Coord) => number;
    toString: (c: Coord) => string;
    from: (x: number, y: number) => Coord;

}

export const coord: CoordFn = {
    Origin: { x: 0, y: 0 },
    Equals: (a, b) => a.x == b.x && a.y == b.y,
    // Manhattan distance
    Distance: (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y),
    Includes: (a, cs) => cs.some(R.partial(coord.Equals, [a])),
    /**
     * Returns possible new coordinates assuming the given direction is taken.
     * @param a Coord
     * @returns 
     */
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