import React, { Component } from "react";
import { Title } from "@src/components/title";
import { Hasher } from "@src/components/hasher";
import { HashDb } from "@src/components/hashDb";
import "./styles.scss";
import { PageSignature } from "@src/model";
import { browser } from "webextension-polyfill-ts";


async function hashCurrentPage(): Promise<PageSignature | undefined> {
    return browser.runtime.sendMessage({});
}

type AppState = {
    hashes: PageSignature[]
}

export class App extends Component<unknown, AppState> {
    constructor(props: unknown) {
        super(props);
        this.state = { hashes: [] };
    }

    async handleClick(): Promise<void> {
        const PageSignature = await hashCurrentPage();
        if (PageSignature !== undefined) {
            const hashes = this.state.hashes.concat(PageSignature);
            this.setState({ hashes });
            // const valid = await executeScript();
            // const validation = valid ? "Similar" : "Different";
            // this.setState({ validation });
        }
    }

    render(): JSX.Element {
        return <div className="popup-container">
            <div className="container mx-4 my-4">
                <Title />
                <hr />
                <Hasher onClick={async () => await this.handleClick()} />
                <hr />
                <HashDb hashes={this.state.hashes} />
            </div>
        </div>
    }
}
