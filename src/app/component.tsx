import "./styles.scss";
import React, { Component } from "react";
import { Title } from "@src/components/title";
import { Sign } from "@src/components/sign";
import { DatabaseView } from "@src/components/databaseView";
import { SignatureDatabase, ValidationIdle, ValidationState, ValidationWithRelatives } from "@src/model";
import { browser } from "webextension-polyfill-ts";
import { clearDatabase, findRelatives, storeSignature } from "@src/signatureUtils";
import { Messenger } from "@src/components/messenger";
import { Clear } from "@src/components/clear/component";

type AppProps = {
    db: SignatureDatabase
}
type AppState = {
    db: SignatureDatabase
    validation: ValidationState
}

export class App extends Component<AppProps, AppState> {
    constructor(props: AppState) {
        super(props);
        this.state = { db: props.db ?? [], validation: ValidationIdle };
    }

    async sign(): Promise<void> {
        const signature = await browser.runtime.sendMessage({});
        if (signature !== undefined) {
            const relatives = findRelatives(signature, this.state.db);
            // TODO: For now I'm not adding to the DB a signature that has relatives as I'm assuming this is 
            // a phishing attempt. But the phisher could be the one already stored.
            if (relatives.length == 0) {
                const newDb = await storeSignature(signature, this.state.db);
                this.setState({
                    db: newDb,
                    validation: ValidationWithRelatives(signature, relatives)
                });
            } else {
                this.setState({ validation: ValidationWithRelatives(signature, relatives) });
            }
        }
    }

    async clear(): Promise<void> {
        await clearDatabase();
        this.setState({ db: [], validation: ValidationIdle });
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
