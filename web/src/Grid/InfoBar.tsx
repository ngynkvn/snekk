import React from "react";
import { Coord } from "../bs-types";
import './InfoBar.css'

export type InfoBarProps = {
    coord: Coord | null;
    currMarker: string;
};

export function InfoBar({ coord, currMarker }: InfoBarProps) {
    return (
        <div
            className="info-bar"
        >
            <div className="info-bar__child">
                &nbsp;
                {coord && (
                    <>
                        X: {coord.x} Y: {coord.y}
                    </>
                )}
            </div>
            <div className="info-bar__child">Marker: {currMarker}</div>
        </div>
    );
}
