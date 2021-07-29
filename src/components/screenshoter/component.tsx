// import { exec } from "child_process";
import React, { Component } from "react";
import { browser, Tabs } from "webextension-polyfill-ts";

async function executeScript(): Promise<boolean> {
    // Query for the active tab in the current window
    const tabs: Tabs.Tab[] = await browser.tabs.query({ active: true, currentWindow: true });
    // Pulls current tab from browser.tabs.query response
    const currentTab: Tabs.Tab | undefined = tabs[0];

    // Short circuits function execution is current tab isn't found
    if (!currentTab) {
        return false;
    }

    const imageUri = await browser.tabs.captureTab();
    console.log(imageUri);

    const result: boolean = await browser.runtime.sendMessage({ imageUri });
    // console.log("sendMessage response:");
    // console.log(result);
    return result;
}

interface ScreenshoterState {
    validationResult: boolean
}

export class Screenshoter extends Component<unknown, ScreenshoterState> {
    constructor(props: unknown) {
        super(props);
        this.state = { validationResult: false };
    }

    async handleClick(): Promise<void> {
        const validationResult = await executeScript();
        console.log("new validationResult:");
        console.log(validationResult);
        this.setState({ validationResult });
    }

    render(): JSX.Element {
        return <div className="row">
            <div className="col-lg-12">
                <button className="btn btn-block btn-outline-dark" onClick={async () => await this.handleClick()}>
                    Calculate Hash {this.state.validationResult ? "Similar" : "Different"}
                </button>
            </div>
        </div>
    }
}
