import { SignatureDatabase } from "@src/model";
import React, { FunctionComponent } from "react";

type DatabaseViewState = { db: SignatureDatabase; }

export const DatabaseView: FunctionComponent<DatabaseViewState> = (state: DatabaseViewState) => {
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
