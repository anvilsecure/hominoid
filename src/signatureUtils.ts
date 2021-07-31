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

function areRelatives(h1: Hash, h2: Hash): boolean {
    return h1.getHammingDistance(h2) <= 10;
}

export function findRelatives(signature: Signature, db: SignatureDatabase): Signature[] {
    const signatureAsHash = new Hash(signature.hash);
    return db.filter((s) => s.url != signature.url && areRelatives(signatureAsHash, new Hash(s.hash)));
}

/////////////////////////
// Storage

export async function storeSignature(signature: Signature, db: SignatureDatabase): Promise<SignatureDatabase> {
    const exists = db.find((s) => s.url === signature.url);
    if (exists) {
        // TODO: See what policy we should take for the same URL with different hashes
        return db;
    } else {
        const newDb = db.concat(signature);
        await browser.storage.local.set({ signatureDatabase: newDb });
        return newDb;
    }
}

export async function loadDatabase(): Promise<SignatureDatabase> {
    const serialized = await browser.storage.local.get("signatureDatabase");
    return (serialized.signatureDatabase ?? []) as SignatureDatabase;
}

export async function clearDatabase(): Promise<void> {
    return browser.storage.local.clear();
}
