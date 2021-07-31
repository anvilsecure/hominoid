export type Signature = { url: string, hash: string };
export type SignatureDatabase = Signature[];

export type VerificationResult =
    | "New"
    | "Similar"
    | "Different";
