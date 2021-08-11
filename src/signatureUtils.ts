import { DifferenceHashBuilder, Hash } from "browser-image-hash";
import { browser } from "webextension-polyfill-ts";
import { SignatureDatabase, Signature, ValidationResult, ValidationMathesDomain, ValidationMathesOtherDomains, ValidationNewDomain } from "./model";

const HAMMING_TOLERANCE = 10;

/////////////////////////
// Signature

function areRelatives(h1: Hash, h2: Hash): boolean {
    return h1.getHammingDistance(h2) <= HAMMING_TOLERANCE;
}

export function validateNewSignatureWithDb(signature: Signature, db: SignatureDatabase): ValidationResult {
    const signatureAsHash = new Hash(signature.hash);
    const relatives = db.filter(s => areRelatives(signatureAsHash, new Hash(s.hash)));
    const relativesOtherDomains = relatives.filter(s => s.domain != signature.domain);

    if (relativesOtherDomains.length == 0) {
        const containsSameDomain = db.find(s => s.domain === signature.domain) != undefined;
        if (containsSameDomain)
            return ValidationMathesDomain(signature);
        else
            return ValidationNewDomain(signature);
    } else {
        return ValidationMathesOtherDomains(signature, relatives);
    }
}

export async function validateNewSignature(signature: Signature): Promise<ValidationResult> {
    const db = await loadDatabase();
    return validateNewSignatureWithDb(signature, db);
}

export async function buildSignature(domain: string, imageUri: string): Promise<Signature> {
    const hash = await new DifferenceHashBuilder()
        .build(new URL(imageUri));
    return { domain, hash: hash.rawHash };
}

/////////////////////////
// Storage

export async function storeSignatureWithDb(signature: Signature, db: SignatureDatabase): Promise<SignatureDatabase> {
    const exists = db.find((s) => s.domain === signature.domain);
    if (exists) {
        // TODO: See what policy we should take for the same URL with different hashes
        return db;
    } else {
        const newDb = db.concat(signature);
        await browser.storage.local.set({ signatureDatabase: newDb });
        return newDb;
    }
}

export async function storeSignature(signature: Signature): Promise<SignatureDatabase> {
    const db = await loadDatabase();
    return storeSignatureWithDb(signature, db);
}

export async function loadDatabase(): Promise<SignatureDatabase> {
    const serialized = await browser.storage.local.get("signatureDatabase");
    return (serialized.signatureDatabase ?? []) as SignatureDatabase;
}

export async function clearDatabase(): Promise<void> {
    return browser.storage.local.clear();
}
