import { useFormik } from "formik";
import React, { useState } from "react";
import "./App.css";
import { Grid } from "./Grid";

function App() {
    const [settings, setSettings] = useState<Settings>({
        width: 11,
        height: 11,
        marker: "D",
        markerOptions: ["D", "S"],
    });

    return (
        <div className="App">
            <Grid {...settings} key={`${settings.width}-${settings.height}`} />
            <Settings settings={settings} setSettings={setSettings} />
        </div>
    );
}

type Settings = {
    width: number;
    height: number;
    marker: string;
    markerOptions: string[];
};
type SettingsProps = {
    settings: Settings;
    setSettings: React.Dispatch<React.SetStateAction<Settings>>;
};
function Settings({
    settings: { marker, markerOptions, width, height },
    setSettings,
}: SettingsProps): JSX.Element {
    const formik = useFormik({
        initialValues: {
            width,
            height,
            marker,
        },
        onSubmit: (newSettings) => {
            setSettings((prevSettings) => ({
                ...prevSettings,
                ...newSettings,
            }));
        },
    });
    return (
        <form
            onSubmit={formik.handleSubmit}
            style={{ display: "grid", gridTemplateColumns: "0fr 1fr" }}
        >
            <label htmlFor="width">Width</label>
            <input
                id="width"
                name="width"
                type="number"
                onChange={formik.handleChange}
                value={formik.values.width}
            ></input>
            <label htmlFor="height">Height</label>
            <input
                id="height"
                name="height"
                type="number"
                onChange={formik.handleChange}
                value={formik.values.height}
            ></input>
            <label htmlFor="marker">Marker</label>
            <select
                value={marker}
                id="marker"
                name="marker"
                onChange={(e) => {
                    setSettings((prev) => ({
                        ...prev,
                        marker: e.target.value,
                    }));
                }}
            >
                {markerOptions.map((value) => {
                    return (
                        <option key={value} value={value}>
                            {value}
                        </option>
                    );
                })}
            </select>
            <button type="submit">Submit</button>
        </form>
    );
}

export default App;
