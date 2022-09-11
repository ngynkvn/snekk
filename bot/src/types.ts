import { Coord } from "./bs-types";
export { Coord };
export class StringMap<T extends object, K> extends Map<T, K> {
    private map: { [key: string]: K } = {};
    set(key: T, value: K): this {
        this.map[JSON.stringify(key)] = value;
        return this;
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
