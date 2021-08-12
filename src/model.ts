export type Signature = { domain: string, hash: string };
export type SignatureDatabase = Signature[];

/////////////////////////
// Result

export type ValidationResult =
    // Something unexpected happened
    // | { type: "error" }
    // The domain is new so it was added to the DB
    | { type: "newDomain", signature: Signature }
    // The domain was already present and this signature is similar to the one present
    | { type: "matchesDomain", signature: Signature }
    // The signature matches a signature for another domain (potential phishing)
    | { type: "matchesOtherDomains", signature: Signature, relatives: Signature[] }

// export const ValidationError: ValidationResult = { type: "error" }
export function ValidationNewDomain(signature: Signature): ValidationResult {
    return { type: "newDomain", signature }
}
export function ValidationMathesDomain(signature: Signature): ValidationResult {
    return { type: "matchesDomain", signature }
}
export function ValidationMathesOtherDomains(signature: Signature, relatives: Signature[]): ValidationResult {
    return { type: "matchesOtherDomains", signature, relatives };
}

/////////////////////////
// State

export type ValidationState =
    | { type: "idle" }
    | { type: "withResult", result: ValidationResult }

export const ValidationIdle: ValidationState = { type: "idle" }
export function ValidationWithResult(result: ValidationResult): ValidationState {
    return { type: "withResult", result };
}
