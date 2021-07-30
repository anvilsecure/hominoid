import React, { FunctionComponent } from "react";

type PageHash = { page: string, hash: string };
type HashDbState = { hashes: PageHash[]; }

export const HashDb: FunctionComponent<HashDbState> = (state: HashDbState) => {
    return <div>
        <div className="row">
            <ul>
                {state.hashes.map((pageHash) => {
                    return <li key={pageHash.page}>{pageHash.page}: {pageHash.hash}</li>;
                })}
            </ul>
        </div>
    </div>
}
