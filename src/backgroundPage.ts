import { browser } from "webextension-polyfill-ts";
import { currentUrl, screenshotCurrentTab } from "./browserUtils";
import { buildSignature } from "./signatureUtils";

browser.runtime.onMessage.addListener(async () => {
    const url = await currentUrl();
    if (url === undefined)
        return undefined;

    const imageUri = await screenshotCurrentTab();
    if (imageUri === undefined)
        return undefined;

    return buildSignature(url, imageUri);
});
