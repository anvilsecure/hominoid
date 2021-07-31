import React, { Component } from "react";

interface SignProps {
    onClick: () => Promise<void>
}

export class Sign extends Component<SignProps> {
    render(): JSX.Element {
        return <div>
            <div className="row">
                <button className="btn btn-block btn-outline-dark" onClick={this.props.onClick}>
                    Verify Signature
                </button>
            </div>
        </div>
    }
}
