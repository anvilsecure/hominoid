import { PageSignature } from "@src/model";
import React, { FunctionComponent } from "react";

type HashDbState = { hashes: PageSignature[]; }

export const HashDb: FunctionComponent<HashDbState> = (state: HashDbState) => {
    return <div>
        <div className="row">
            <ul>
                {state.hashes.map((PageSignature) => {
                    return <li key={PageSignature.url}>{PageSignature.url}: {PageSignature.hash}</li>
                })}
            </ul>
        </div>
    </div>
}
