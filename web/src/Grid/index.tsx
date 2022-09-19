import React, { useState } from "react";
import { Battlesnake, Coord, GameState } from "../bs-types";
import { setupGridStyle, createGridMap } from "./Grid";
import { InfoBar } from "./InfoBar";
import { useRow, useRowListener, useTable } from "tinybase/ui-react";

const useSettings = () => {
    const row = useRow("ui", "settings");
    const width = row["width"] as number;
    const height = row["height"] as number;
    const marker = row["marker"] as string;
    return { width, height, marker };
};

const useBoardState = () => {
    const table = useTable("snakes");
};

const useGameState = () => {
    const { width, height, marker } = useSettings();
    const [gameState, setGameState] = useState<GameState>({
        board: {
            food: [],
            hazards: [],
            snakes: [],
            height,
            width,
        },
        turn: 0,
        you: {} as any,
        game: {} as any,
    });
    const addSnake = (battleSnake: Battlesnake) => {
        setGameState((state: GameState) => {
            state.board.snakes.push(battleSnake);
            return state;
        });
    };
    const delSnake = (battleSnake: {id: string}) => {
        setGameState((state: GameState) => {
            state.board.snakes = state.board.snakes.filter(
                (s) => s.id === battleSnake.id
            );
            return state;
        });
    };

    const addTail = () => {};

    const delTail = () => {};

    return { gameState, addSnake, delSnake };
};

export function Grid() {
    const { width, height, marker } = useSettings();
    const colors = useTable("marker_options");

    const resetState = () => Array.from(new Array(height * width));
    const [gridState, setGridState] = useState(resetState());
    const { gameState, addSnake } = useGameState();
    useRowListener("ui", "settings", (_store, table, row, getCellChange) => {
        if (!getCellChange) {
            return;
        }
        const [changedWidth] = getCellChange(table, row, "width");
        const [changedHeight] = getCellChange(table, row, "height");
        if (changedWidth || changedHeight) {
            setGridState(resetState());
        }
    });

    const gridMap = createGridMap(height, width, gridState);
    const [coord, setCoord] = useState<Coord | null>(null);
    const mark = (v: number) =>
        setGridState((gs) => {
            gs[v] = marker;
            return [...gs];
        });

    return (
        <div>
            <div id="grid-view" style={setupGridStyle(width)}>
                {gridMap.flat().map(({ mapKey, value }) => {
                    let backgroundColor = "#333";
                    if(value in colors) {
                        backgroundColor = colors[value].color;
                    } else {
                        console.log(colors)
                    }
                    const s: React.CSSProperties = {
                        display: "block",
                        width: 30,
                        height: 30,
                        backgroundColor,
                    };
                    return (
                        <button
                            onClick={() => mark(mapKey)}
                            key={mapKey}
                            style={s}
                            className="grid-view__cell"
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
            <InfoBar coord={coord} currMarker={marker} />
        </div>
    );
}
