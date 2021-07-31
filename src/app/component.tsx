import "./styles.scss";
import React, { Component } from "react";
import { Title } from "@src/components/title";
import { Signer } from "@src/components/hasher";
import { DatabaseView } from "@src/components/databaseView";
import { SignatureDatabase, Signature } from "@src/model";
import { browser } from "webextension-polyfill-ts";
import { storeSignature, verifySignature } from "@src/signatureUtils";

type AppState = {
    db: SignatureDatabase
}

export class App extends Component<AppState, AppState> {
    constructor(props: AppState) {
        super(props);
        this.state = { db: props.db ?? [] };
    }

    async handleClick(): Promise<void> {
        const signature: Signature | undefined = await browser.runtime.sendMessage({});
        if (signature !== undefined) {

            switch (verifySignature(signature, this.state.db)) {
                case "New":
                    const newDb = await storeSignature(signature, this.state.db);
                    this.setState({ db: newDb });
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
                <Signer onClick={async () => await this.handleClick()} />
                <hr />
                <DatabaseView db={this.state.db} />
            </div>
        </div>
    }
}
