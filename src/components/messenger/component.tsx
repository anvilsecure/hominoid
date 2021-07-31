import { ValidationState } from "@src/model";
import React, { Component } from "react";

interface MessengerState {
    validation: ValidationState
}

export class Messenger extends Component<MessengerState> {
    renderValidation(): JSX.Element {
        switch (this.props.validation.type) {
            case "idle":
                return <a></a>;
            case "noRelatives":
                return <div className="alert alert-success">
                    <a>This page looks safe</a>
                </div>;
            case "withRelatives":
                const relatives = this.props.validation.relatives;
                console.log(relatives);
                return <div className="alert alert-danger">
                    <a>{relatives.length} similar URLs found in database:</a>
                    <ul>
                        {relatives.map((relative, i) => {
                            return <li key={i}>{relative.url}</li>
                        })}
                    </ul>
                </div>;
        }
    }

    render(): JSX.Element {
        return <div className="row">
            {this.renderValidation()}
        </div>
    }
}
