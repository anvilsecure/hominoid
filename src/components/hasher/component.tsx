import { ValidationState } from "@src/model";
import React, { Component } from "react";

interface SignerProps {
    onClick: () => Promise<void>
}
interface SignerState {
    validation: ValidationState
}

export class Signer extends Component<SignerProps, SignerState> {
    constructor(props: SignerProps) {
        super(props);
        this.state = { validation: "Idle" };
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
                <button className="btn btn-block btn-outline-dark" onClick={this.props.onClick}>
                    Verify Signature
                </button>
            </div>
            <div className="row">
                {validation}
            </div>
        </div>
    }
}
