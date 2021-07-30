import React, { Component } from "react";
import { Title } from "@src/components/title";
import { Hasher } from "@src/components/hasher";
import { HashDb } from "@src/components/hashDb";
import "./styles.scss";
import { SignatureDatabase, Signature } from "@src/model";
import { browser } from "webextension-polyfill-ts";
import { verifySignature } from "@src/hashUtils";

type AppState = {
    db: SignatureDatabase
}

export class App extends Component<unknown, AppState> {
    constructor(props: unknown) {
        super(props);
        this.state = { db: [] };
    }

    async handleClick(): Promise<void> {
        const signature: Signature | undefined = await browser.runtime.sendMessage({});
        if (signature !== undefined) {

            switch (verifySignature(signature, this.state.db)) {
                case "New":
                    const db = this.state.db.concat(signature);
                    this.setState({ db });
                    break;
                case "Different":
                    alert("TODO MAL");
                    console.log("TODO MAL");
                    break;
                case "Similar":
                    console.log("Todo bien!");
                    break;
            }

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
                <HashDb db={this.state.db} />
            </div>
        </div>
    }
}
