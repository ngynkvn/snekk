import { useFormik } from "formik";
import React, { useState } from "react";
import "./App.css";
import { Grid } from "./Grid";

function App() {
    const [settings, setSettings] = useState<Settings>({
        width: 11,
        height: 11,
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
};
type SettingsProps = {
    settings: Settings;
    setSettings: React.Dispatch<React.SetStateAction<Settings>>;
};
function Settings({ settings, setSettings }: SettingsProps): JSX.Element {
    const formik = useFormik({
        initialValues: {
            width: settings.width,
            height: settings.height,
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
            <button type="submit">Submit</button>
        </form>
    );
}

function Form() {
    const [urlInput, setUrl] = useState("localhost:8080/");
    const fetchMove = () => {};

    return (
        <div>
            Input
            <input
                type={"text"}
                onChange={(e) => {
                    setUrl(e.target.value);
                }}
            />
            <div>Game State</div>
            <button onClick={fetchMove}>Get Move</button>
        </div>
    );
}

export default App;
