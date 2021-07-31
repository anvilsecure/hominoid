import React, { Component } from "react";

interface ClearProps {
    onClick: () => Promise<void>
}

export class Clear extends Component<ClearProps> {
    render(): JSX.Element {
        return <div>
            <div className="row">
                <button className="btn btn-block btn-warning" onClick={this.props.onClick}>
                    Clear Database
                </button>
            </div>
        </div>
    }
}
