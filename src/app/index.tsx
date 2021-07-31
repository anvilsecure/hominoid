import * as React from "react";
import * as ReactDOM from "react-dom";
import { browser } from "webextension-polyfill-ts";
import { App } from "./component";
import "../scss/app.scss";
import { loadDatabase } from "@src/hashUtils";

// // // //

browser.tabs.query({ active: true, currentWindow: true }).then(async () => {
    const db = await loadDatabase();
    ReactDOM.render(<App db={db} />, document.getElementById("app"));
});
