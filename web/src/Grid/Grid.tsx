import { useState } from "react";
import { Coord, GameState } from "../bs-types";
import "../App.css";

type DeepPartial<T> = T extends object
    ? {
          [P in keyof T]?: DeepPartial<T[P]>;
      }
    : T;

export type GameStateForm = DeepPartial<GameState>;

export type GridProps = {
    width: number;
    height: number;
    marker: string;
};
export function setupGridStyle(width: number): React.CSSProperties {
    return {
        display: "grid",
        width: "100%",
        height: "800 px",
        gridTemplateColumns: `repeat(${width}, 1fr)`,
        gridTemplateRows: `repeat(${width}, 1fr)`,
    };
}

export function createGridMap(height: number, width: number, gridState: any[]) {
    const gridObjects = [];
    for (let j = height - 1; j >= 0; j--) {
        const row = [];
        for (let i = 0; i < width; i++) {
            const gI = i + j * width;
            row.push({ mapKey: gI, value: gridState[gI] });
        }
        gridObjects.push(row);
    }
    return gridObjects;
}
