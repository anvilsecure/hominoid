import { browser, Tabs } from "webextension-polyfill-ts";
import { DifferenceHashBuilder } from "browser-image-hash";
import { Signature } from "./model";

function convertBase64ToBlob(base64String: string): Blob {
    const arr = base64String.split(",");
    const mime = ((arr[0] ?? "").match(/:(.*?);/) ?? [])[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const uint8Array = new Uint8Array(n);
    while (n--) {
        uint8Array[n] = bstr.charCodeAt(n);
    }
    return new Blob([uint8Array], { type: mime });
}

function downloadImageUri(imageUri: string) {
    const blob = convertBase64ToBlob(imageUri);
    browser.downloads.download({
        url: URL.createObjectURL(blob),
        filename: "screenshot.png",
    });
}

browser.runtime.onMessage.addListener(async (): Promise<Signature | undefined> => {
    const tabs: Tabs.Tab[] = await browser.tabs.query({ active: true, currentWindow: true });
    const currentTab: Tabs.Tab | undefined = tabs[0];
    if (!currentTab)
        return undefined;
    const url = currentTab.url;
    if (url === undefined)
        return undefined;

    const imageUri = await browser.tabs.captureTab();
    // downloadImageUri(imageUri);

    const hash = await new DifferenceHashBuilder().build(new URL(imageUri));
    return { url, hash: hash.rawHash };
});
