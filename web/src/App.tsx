import { useFormik, Formik, Form, Field } from "formik";
import React, { useState } from "react";
import {
    useCell,
    useRow,
    useSetRowCallback,
    useStore,
} from "tinybase/ui-react";
import "./App.css";
import { Grid } from "./Grid";

function App() {
    return (
        <div className="App">
            <Grid />
            <Settings />
        </div>
    );
}

function Settings(): JSX.Element {
    const store = useStore();
    const updateSettings = useSetRowCallback(
        "ui",
        "settings",
        (settings: any) => {
            return {
                width: settings.width,
                height: settings.height,
                marker: settings.marker,
            };
        }
    );
    if (!store) {
        // Loading
        return <>...</>;
    }

    const { width, height, marker } = store.getRow("ui", "settings") as any;
    const marker_options = store.getTable("marker_options");
    const markerOptions = Object.keys(marker_options);

    return (
        <Formik
            initialValues={{
                width,
                height,
                marker,
            }}
            onSubmit={updateSettings}
        >
            {(props) => (
                <form onSubmit={props.handleSubmit}>
                    <label htmlFor="width">Width</label>
                    <input
                        id="width"
                        name="width"
                        type="number"
                        onChange={props.handleChange}
                        value={props.values.width}
                    ></input>
                    <label htmlFor="height">Height</label>
                    <input
                        id="height"
                        name="height"
                        type="number"
                        onChange={props.handleChange}
                        value={props.values.height}
                    ></input>
                    <div>
                        <label htmlFor="marker">Marker</label>
                        <div>
                            {markerOptions.map((value) => (
                                <LabelField
                                    value={value}
                                    key={value}
                                    onChange={(e: any) => {
                                        props.handleChange(e);
                                        store.setCell(
                                            "ui",
                                            "settings",
                                            "marker",
                                            value
                                        );
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                    <button type="submit">Submit</button>
                </form>
            )}
        </Formik>
    );
}

const LabelField = ({ value, onChange }: any) => {
    return (
        <label>
            {value}:
            <Field
                type="radio"
                name="marker"
                key={value}
                value={value}
                onChange={onChange}
            />
        </label>
    );
};

export default App;
