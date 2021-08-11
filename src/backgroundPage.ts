import { browser } from "webextension-polyfill-ts";
import { currentDomain, screenshotCurrentTab } from "./browserUtils";
import { buildSignature } from "./signatureUtils";

browser.runtime.onMessage.addListener(async () => {
    const domain = await currentDomain();
    if (domain === undefined)
        return undefined;

    const imageUri = await screenshotCurrentTab();
    if (imageUri === undefined)
        return undefined;

    return buildSignature(domain, imageUri);
});
