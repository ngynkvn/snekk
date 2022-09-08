import { Coord } from "../bs-types";

export type Decision = 'up' | 'down' | 'left' | 'right';
export type Point = [number, number];
export type Safe = 'S';
export type Death = 'D';
export type Outside = 'O';
export type Player = string;
export type CellType = Safe | Death | Player | Outside;
export type Map = CellType[];

// TODO: Probably a better name than 'World'
export class World {
    map: Array<CellType>;
    // Dimensions
    width: number
    height: number
    // Boundaries
    max: { x: number, y: number };
    min: { x: number, y: number };

    constructor(width: number, height: number) {
        this.map = Array.from(Array(width * height)).map(_ => 'S');
        this.max = { x: width - 1, y: height - 1 };
        this.min = { x: 0, y: 0 };
        this.width = width
        this.height = height
    }

    static fromString(width: number, height: number, str: string): World {
        const w = new World(width, height);
        const arr = str.split('');
        if (arr.length !== w.map.length) {
            throw 'String length mismatched'
        }
        w.map = arr as Array<CellType>;
        return w
    }

    i(c: Coord): number {
        return c.x + c.y * this.height
    };
    c(i: number): Coord {
        return { x: i % this.width, y: Math.floor(i / this.width) }
    };

    check(c: Coord): CellType {
        if(this.inBounds(c)) {
            return this.map[this.i(c)]
        } else {
            return 'O';
        }
    }
    mark(type: CellType): (c: Coord) => void {
        return (c: Coord) => this.map[this.i(c)] = type;
    };
    inBounds({ x, y }: Coord): boolean {
        return (x >= 0 && x < this.width) && (y >= 0 && y < this.height)
    };
    isSafe(c: Coord): boolean {
        return this.inBounds(c) && this.map[this.i(c)] == 'S'
    };
    spanOut({ x, y }: Coord): (Coord & { dir: string })[] {
        return [
            { x: x + 1, y, dir: 'right' },
            { x: x - 1, y, dir: 'left' },
            { y: y + 1, x, dir: 'up' },
            { y: y - 1, x, dir: 'down' },
        ].filter(this.isSafe.bind(this))
    };
}