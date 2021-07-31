import "./styles.scss";
import React, { Component } from "react";
import { Title } from "@src/components/title";
import { Sign } from "@src/components/sign";
import { DatabaseView } from "@src/components/databaseView";
import { SignatureDatabase, Signature, VerificationResult } from "@src/model";
import { browser } from "webextension-polyfill-ts";
import { clearDatabase, storeSignature, verifySignature } from "@src/signatureUtils";
import { Messenger } from "@src/components/messenger";
import { Clear } from "@src/components/clear/component";

type AppProps = {
    db: SignatureDatabase
}
type AppState = {
    db: SignatureDatabase
    validation: VerificationResult | undefined
}

export class App extends Component<AppProps, AppState> {
    constructor(props: AppState) {
        super(props);
        this.state = { db: props.db ?? [], validation: undefined };
    }

    async sign(): Promise<void> {
        const signature: Signature | undefined = await browser.runtime.sendMessage({});
        if (signature !== undefined) {

            switch (verifySignature(signature, this.state.db)) {
                case "New":
                    const newDb = await storeSignature(signature, this.state.db);
                    this.setState({ validation: "New", db: newDb });
                    break;
                case "Different":
                    this.setState({ validation: "Different" });
                    break;
                case "Similar":
                    this.setState({ validation: "Similar" });
                    break;
            }
        }
    }

    async clear(): Promise<void> {
        await clearDatabase();
        this.setState({ db: [], validation: undefined });
    }

    render(): JSX.Element {
        return <div className="popup-container">
            <div className="container mx-4 my-4">
                <Title />
                <hr />
                <Sign onClick={async () => await this.sign()} />
                <Clear onClick={async () => await this.clear()} />
                <Messenger validation={this.state.validation} />
                <hr />
                <DatabaseView db={this.state.db} />
            </div>
        </div>
    }

}
