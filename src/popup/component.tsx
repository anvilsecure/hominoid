import React, { FunctionComponent } from "react";
import { Title } from "@src/components/title";
import { Hasher } from "@src/components/hasher";
import { HashDb } from "@src/components/hashDb";
import "./styles.scss";

export const Popup: FunctionComponent = () => {
    return (
        <div className="popup-container">
            <div className="container mx-4 my-4">
                <Title />
                <hr />
                <Hasher />
                <hr />
                <HashDb hashes={[{ page: "pepe.com", hash: "123123" }]} />
            </div>
        </div>
    );
};
