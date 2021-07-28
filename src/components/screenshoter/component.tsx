import React, { FunctionComponent } from "react";
import "./styles.scss";
import { browser, Tabs } from "webextension-polyfill-ts";

/**
 * Executes a string of Javascript on the current tab
 * @param code The string of code to execute on the current tab
 */
function executeScript(code: string): void {
    // Query for the active tab in the current window
    browser.tabs
        .query({ active: true, currentWindow: true })
        .then((tabs: Tabs.Tab[]) => {
            // Pulls current tab from browser.tabs.query response
            const currentTab: Tabs.Tab | undefined = tabs[0];

            // Short circuits function execution is current tab isn't found
            if (!currentTab) {
                return;
            }

            // Executes the script in the current tab
            browser.tabs
                .executeScript(currentTab.id, {
                    code,
                })
                .then(() => {
                    console.log("Done Scrolling");
                });
        });
}

// // // //

export const Screenshoter: FunctionComponent = () => {
    return (
        <div className="row">
            <div className="col-lg-12">
                <button
                    className="btn btn-block btn-outline-dark"
                    onClick={(): void => executeScript("alert(1)")}
                >
                    Alert(1)
                </button>
                <button
                    className="btn btn-block btn-outline-dark"
                    onClick={(): void => executeScript("alert(2)")}
                >
                    Alert(2)
                </button>
            </div>
        </div>
    );
};
