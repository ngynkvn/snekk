import React, { useState } from "react";
import { Coord } from "../bs-types";
import {
    GridProps,
    GameStateForm,
    setupGridStyle,
    createGridMap,
} from "./Grid";
import { InfoBar } from "./InfoBar";

export function Grid({ width, height, marker }: GridProps) {
    const [gridState, setGridState] = useState(
        Array.from(new Array(height * width))
    );
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
            <InfoBar
                coord={coord}
                currMarker={marker}
            />
        </div>
    );
}


