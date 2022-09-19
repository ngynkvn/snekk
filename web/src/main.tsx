import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { createQueries, createStore } from "tinybase";
import { Provider } from "tinybase/ui-react";

const store = createStore().setTables({
    ui: {
        settings: { width: 11, height: 11, marker: "S" },
        marker_options: {D: "#300", F: "#030", S: "#222"}
    },
    marker_options: {
      D: {color: "#300"},
      F: {color: "#030"},
      S: {color: "#222"},
      kepp: {color: "#131"},
    },
    snakes: {
      kepp: {id: 'kepp', x: 0, y: 0, order: 0, you: true}
    },
    metrics: {
    }
});

const queries = createQueries(store);
queries.setQueryDefinition("getYou", "snakes", ({select, where}) => {
  select('id');
  select('x');
  select('y');
  where('you', true);
});
queries.setQueryDefinition("heads", "snakes", ({select, where}) => {
  select('id');
  select('x');
  select('y');
  where('ord', 0);
});

window.store = store;

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </React.StrictMode>
);
