import React, { FunctionComponent } from "react";
import { browser, Tabs } from "webextension-polyfill-ts";

const CODE = `
  import {DifferenceHashBuilder, Hash} from 'browser-image-hash';

  const builder = new DifferenceHashBuilder();
  const targetURL = new URL('./example.jpg', window.location.href);
  const destHash = await builder.build(targetURL);
  const srcHash = new Hash('0111011001110000011110010101101100110011000100110101101000111000');
 
  if (srcHash.getHammingDistance(destHash) <= 10) {
     console.log('Resembles');
     return;
  }
 
  console.log('Different');
`;

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

            browser.tabs.executeScript(currentTab.id, {
                file: "jquery.min.js",
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
