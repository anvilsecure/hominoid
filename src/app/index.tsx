import * as React from "react";
import * as ReactDOM from "react-dom";
import { browser } from "webextension-polyfill-ts";
import { App } from "./component";
import "../scss/app.scss";

// // // //

browser.tabs.query({ active: true, currentWindow: true }).then(() => {
    ReactDOM.render(<App />, document.getElementById("app"));
});
