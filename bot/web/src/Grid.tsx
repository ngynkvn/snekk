import { useState } from "react";
import { Coord, GameState } from "./bs-types";
import "./App.css";

type DeepPartial<T> = T extends object
    ? {
          [P in keyof T]?: DeepPartial<T[P]>;
      }
    : T;

export type GameStateForm = DeepPartial<GameState>;

export type GridProps = {
    width: number;
    height: number;
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

export function Grid({ width, height }: GridProps) {
    const [gameState, setGameState] = useState<GameStateForm>({
        board: {
            width,
            height,
            snakes: [],
            hazards: [],
            food: [],
        },
        game: undefined,
        turn: 0,
        you: {
            body: [],
            head: {},
        },
    });

    const [gridState, setGridState] = useState(
        Array.from(new Array(height * width))
    );
    const gridObjects = [];
    for (let j = height - 1; j >= 0; j--) {
        const row = [];
        for (let i = 0; i < width; i++) {
            const gI = i + j * width;
            row.push({ mapKey: gI, value: gridState[gI] });
        }
        gridObjects.push(row);
    }
    const mark = (v: number) =>
        setGridState((gs) => {
            gs[v] = "D";
            return [...gs];
        });
    const [coord, setCoord] = useState<Coord | null>(null);

    return (
        <div>
            <div id="grid-view" style={setupGridStyle(width)}>
                {gridObjects.flat().map(({ mapKey, value }) => {
                    const backgroundColor = value === "D" ? "#300" : "#222";
                    const s: React.CSSProperties = {
                        display: "block",
                        width: 30,
                        height: 30,
                        backgroundColor: backgroundColor,
                    };
                    return (
                        <button
                            onClick={() => mark(mapKey)}
                            key={mapKey}
                            style={s}
                            className="cell"
                            onMouseEnter={() => {
                                setCoord({
                                    x: mapKey % width,
                                    y: Math.floor(mapKey / width),
                                });
                            }}
                            onMouseLeave={() => {
                                setCoord(null);
                            }}
                        >
                            {mapKey}
                        </button>
                    );
                })}
            </div>
            <div id="info-bar">
                &nbsp;
                {coord && (
                    <div style={{ float: "right" }}>
                        X: {coord.x} Y: {coord.y}
                    </div>
                )}
            </div>
        </div>
    );
}
