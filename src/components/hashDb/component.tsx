import { SignatureDatabase } from "@src/model";
import React, { FunctionComponent } from "react";

type HashDbState = { db: SignatureDatabase; }

export const HashDb: FunctionComponent<HashDbState> = (state: HashDbState) => {
    return <div>
        <div className="row">
            <ul>
                {state.db.map((page) => {
                    return <li key={page.url}>{page.url}: {page.hash.toString()}</li>
                })}
            </ul>
        </div>
    </div>
}
