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
    return browser.runtime.sendMessage({ imageUri });
}

type ValidationState =
    | "Idle"
    | "Similar"
    | "Different";

interface ScreenshoterState {
    validation: ValidationState
}

export class Screenshoter extends Component<unknown, ScreenshoterState> {
    constructor(props: unknown) {
        super(props);
        this.state = { validation: "Idle" };
    }

    async handleClick(): Promise<void> {
        const valid = await executeScript();
        const validation = valid ? "Similar" : "Different";
        this.setState({ validation });
    }

    renderValidation(): JSX.Element {
        switch (this.state.validation) {
            case "Idle": return <a className="alert alert-dark">Idle</a>;
            case "Similar": return <a className="alert alert-success">Similar</a>;
            case "Different": return <a className="alert alert-danger">Different</a>;
        }
    }

    render(): JSX.Element {
        const validation = this.renderValidation();
        return <div>
            <div className="row">
                <button className="btn btn-block btn-outline-dark" onClick={async () => await this.handleClick()}>
                    Calculate Hash
                </button>
            </div>
            <div className="row">
                {validation}
            </div>
        </div>
    }
}
