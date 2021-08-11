import { browser, Tabs } from "webextension-polyfill-ts";
import { currentDomain, screenshotCurrentTab } from "./browserUtils";
import { Signature } from "./model";
import { buildSignature, storeSignature, validateNewSignature } from "./signatureUtils";

export async function sign(): Promise<void> {
    const signature = await signCurrentTab();
    if (!signature) {
        console.error("Failed to sign the current page");
    } else {
        const result = await validateNewSignature(signature);
        // TODO: For now I'm not adding to the DB a signature that has relatives as I'm assuming this is 
        // a phishing attempt. But the phisher could be the one already stored.
        if (result.type != "matchesOtherDomains") {
            await storeSignature(signature);
        }
    }
}

async function signCurrentTab(): Promise<Signature | undefined> {
    const domain = await currentDomain();
    if (!domain)
        return undefined;

    const imageUri = await screenshotCurrentTab();
    if (!imageUri)
        return undefined;

    return buildSignature(domain, imageUri);
}


browser.webNavigation.onCompleted.addListener(async (details) => {
    if (details.frameId == 0) {
        console.log('signing');
        await sign();
    }
})
