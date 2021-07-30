export type Signature = { url: string, hash: string };
export type SignatureDatabase = Signature[];

export type ValidationState =
    | "Idle"
    | "Similar"
    | "Different";

export type VerificationResult =
    | "New"
    | "Similar"
    | "Different";
