import { Coord as ICoord } from "./bs-types";
export class StringMap<T extends object, K> extends Map<T, K> {
  private map: { [key: string]: K } = {};
  set(key: T, value: K): this {
    this.map[JSON.stringify(key)] = value;
    return this
  }
  get(key: T): K | undefined {
    return this.map[JSON.stringify(key)];
  }
  has(key: T): boolean {
    return this.map[JSON.stringify(key)] !== undefined;
  }
}

export class StringSet<T extends object> {
  private _set: Set<string> = new Set();
  add(key: T): void {
    this._set.add(JSON.stringify(key));
  }
  has(key: T): boolean {
    return this._set.has(JSON.stringify(key));
  }
}

export function neighborCoords(coord: Coord): Coord[] {
  return [
    { x: coord.x - 1, y: coord.y },
    { x: coord.x + 1, y: coord.y },
    { x: coord.x, y: coord.y - 1 },
    { x: coord.x, y: coord.y + 1 },
  ].map(Coord.from);
}

export class Coord implements ICoord {
  constructor(public x: number, public y: number) { }
  static from(coord: ICoord): Coord {
    return new Coord(coord.x, coord.y);
  }
  existsIn(coords: ICoord[]): boolean {
    return coords.some((c) => c.x == this.x && c.y == this.y);
  }
  toString(): string {
    return `(${this.x}, ${this.y})`;
  }
}
