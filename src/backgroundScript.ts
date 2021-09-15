import { browser } from "webextension-polyfill-ts";
import { currentDomain, screenshotCurrentTab } from "./browserUtils";
import { Signature, ValidationResult } from "./model";
import { buildSignature, storeSignature, validateNewSignature } from "./signatureUtils";


async function signCurrentTab(): Promise<Signature | undefined> {
    const domain = await currentDomain();
    const imageUri = await screenshotCurrentTab();
    if (!imageUri)
        return undefined;

    return buildSignature(domain, imageUri);
}

async function notify(title: string, message: string): Promise<void> {
    browser.notifications.create(title, {
        "type": "basic",
        "iconUrl": browser.runtime.getURL("icons/cake-96.png"),
        title,
        message
    });
}
async function showError(message: string): Promise<void> { return notify("Error", message); }

async function showResult(result: ValidationResult): Promise<void> {
    switch (result.type) {
        case "newDomain":
            return notify("A new domain", "New domain added to the DB");
        case "matchesDomain":
            return notify("You've been here before", "This domain was already visited");
        case "matchesOtherDomains":
            return notify("This looks phishy!",
                `${result.relatives.length} similar signatures found in database for domain ${result.signature.domain}:` +
                result.relatives.map((relative) => `- ${relative.domain}\n`)
            );
    }
}

async function signAndValidate(): Promise<void> {
    const signature = await signCurrentTab();
    if (!signature) {
        showError("Failed to sign the current page");
    } else {
        const result = await validateNewSignature(signature);
        // TODO: For now I'm not adding to the DB a signature that has relatives as I'm assuming this is 
        // a phishing attempt. But the phisher could be the one already stored.
        if (result.type != "matchesOtherDomains") {
            await storeSignature(signature);
        }
        await showResult(result);
    }
}

browser.webNavigation.onCompleted.addListener(async (details) => {
    if (details.frameId == 0) {
        await signAndValidate();
    }
})
