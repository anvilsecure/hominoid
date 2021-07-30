import { Hash } from "browser-image-hash";
import { SignatureDatabase, Signature, VerificationResult } from "./model";

export function verifySignature(signature: Signature, db: SignatureDatabase): VerificationResult {
    const existing = db.find((s) => s.url === signature.url);
    if (existing === undefined)
        return "New";
    else {
        const existingAsHash = new Hash(existing.hash);
        const signatureAsHash = new Hash(signature.hash);
        const distance = signatureAsHash.getHammingDistance(existingAsHash);
        return distance <= 10 ? "Similar" : "Different";
    }
}
