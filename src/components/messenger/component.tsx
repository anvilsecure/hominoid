import { ValidationResult, ValidationState } from "@src/model";
import React, { Component } from "react";

interface MessengerState {
    validation: ValidationState
}

export class Messenger extends Component<MessengerState> {
    renderValidation(): JSX.Element {
        switch (this.props.validation.type) {
            case "idle":
                return <a></a>;
            case "withResult":
                return this.renderResult(this.props.validation.result);
        }
    }

    renderResult(result: ValidationResult): JSX.Element {
        switch (result.type) {
            case "newDomain":
                return <div className="alert alert-info">
                    <a>New domain added to the DB</a>
                </div>;
            case "matchesDomain":
                return <div className="alert alert-success">
                    <a>This domain was already visited</a>
                </div>;
            case "matchesOtherDomains":
                const relatives = result.relatives;
                return <div className="alert alert-danger">
                    <a>{relatives.length} similar signatures found in database for domain {result.signature.domain}:</a>
                    <ul>
                        {relatives.map((relative, i) => {
                            return <li key={i}>{relative.domain}</li>;
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
