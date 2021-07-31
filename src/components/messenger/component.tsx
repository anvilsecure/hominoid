import { VerificationResult } from "@src/model";
import React, { Component } from "react";

interface MessengerState {
    validation: VerificationResult | undefined
}

export class Messenger extends Component<MessengerState> {
    renderValidation(): JSX.Element {
        switch (this.props.validation) {
            case undefined: return <a></a>;
            case "New": return <a className="alert alert-dark">Signature added to the database</a>;
            case "Similar": return <a className="alert alert-success">Similar</a>;
            case "Different": return <a className="alert alert-danger">Different</a>;
        }
    }

    render(): JSX.Element {
        const validation = this.renderValidation();
        return <div className="row">
            {validation}
        </div>
    }
}
