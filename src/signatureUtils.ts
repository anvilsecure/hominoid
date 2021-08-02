import { DifferenceHashBuilder, Hash } from "browser-image-hash";
import { browser } from "webextension-polyfill-ts";
import { SignatureDatabase, Signature } from "./model";

/////////////////////////
// Signature

function areRelatives(h1: Hash, h2: Hash): boolean {
    return h1.getHammingDistance(h2) <= 10;
}

export function findRelatives(signature: Signature, db: SignatureDatabase): Signature[] {
    const signatureAsHash = new Hash(signature.hash);
    return db.filter((s) => s.url != signature.url && areRelatives(signatureAsHash, new Hash(s.hash)));
}

export async function buildSignature(url: string, imageUri: string): Promise<Signature> {
    const hash = await new DifferenceHashBuilder()
        .build(new URL(imageUri));
    return { url, hash: hash.rawHash };
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
