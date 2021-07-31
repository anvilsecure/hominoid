export type Signature = { url: string, hash: string };
export type SignatureDatabase = Signature[];

export type VerificationResult =
    | "New"
    | "Similar"
    | "Different";

export type ValidationState =
    | { type: "idle" }
    | { type: "noRelatives", signature: Signature }
    | { type: "withRelatives", signature: Signature, relatives: Signature[] }

export const ValidationIdle: ValidationState = { type: "idle" }
export function ValidationWithRelatives(signature: Signature, relatives: Signature[]): ValidationState {
    return relatives.length == 0 ?
        { type: "noRelatives", signature } :
        { type: "withRelatives", signature, relatives };
}
