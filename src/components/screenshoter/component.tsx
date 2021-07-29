import { image } from "html2canvas/dist/types/css/types/image";
import React, { FunctionComponent } from "react";
import { browser, Tabs } from "webextension-polyfill-ts";

const CODE = `
`;

/**
 * Executes a string of Javascript on the current tab
 * @param code The string of code to execute on the current tab
 */
async function executeScript(code: string): Promise<void> {
    // Query for the active tab in the current window
    browser.tabs
        .query({ active: true, currentWindow: true })
        .then(async (tabs: Tabs.Tab[]) => {
            // Pulls current tab from browser.tabs.query response
            const currentTab: Tabs.Tab | undefined = tabs[0];

            // Short circuits function execution is current tab isn't found
            if (!currentTab) {
                return;
            }

            const imageUri = await browser.tabs.captureTab();
            console.log(imageUri);
            //     (imageUri) => {
            //         console.log(imageUri);
            //     },
            //     (error) => {
            //         console.log(error);
            //     },
            // );

            browser.runtime.sendMessage({ imageUri });

            // const newTab = await browser.tabs.create({ url: "about:blank" });
            // browser.tabs.executeScript(newTab.id, {
            //     code: "document.createElement('img').src = " + imageUri,
            // });

            browser.tabs.executeScript(currentTab.id, {
                file: "js/screenshoter.js",
            });

            // Executes the script in the current tab
            browser.tabs
                .executeScript(currentTab.id, {
                    code,
                })
                .then(() => {
                    console.log("Done executing code");
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
                    onClick={() => executeScript(CODE)}
                >
                    Calculate Hash
                </button>
            </div>
        </div>
    );
};
