import "./styles.scss";
import React, { Component } from "react";
import { Title } from "@src/components/title";
import { DatabaseView } from "@src/components/databaseView";
import { SignatureDatabase, ValidationIdle, ValidationState } from "@src/model";
import { clearDatabase } from "@src/signatureUtils";
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

    async clear(): Promise<void> {
        await clearDatabase();
        this.setState({ db: [], validation: ValidationIdle });
    }

    render(): JSX.Element {
        return <div className="popup-container">
            <div className="container mx-4 my-4">
                <Title />
                <hr />
                <Clear onClick={async () => await this.clear()} />
                <Messenger validation={this.state.validation} />
                <hr />
                <DatabaseView db={this.state.db} />
            </div>
        </div>
    }
}
