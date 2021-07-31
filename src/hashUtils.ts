import { Hash } from "browser-image-hash";
import { browser } from "webextension-polyfill-ts";
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

export async function storeSignature(signature: Signature, db: SignatureDatabase): Promise<SignatureDatabase> {
    const newDb = db.concat(signature);
    await browser.storage.local.set({ signatureDatabase: newDb });
    return newDb;
}

export async function loadDatabase(): Promise<SignatureDatabase> {
    const serialized = await browser.storage.local.get("signatureDatabase");
    return (serialized.signatureDatabase ?? []) as SignatureDatabase;
}
