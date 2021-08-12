import { browser, Windows } from "webextension-polyfill-ts";

const COMPARABLE_WINDOW_WIDTH = 360;
const COMPARABLE_WINDOW_HEIGHT = 640;
const DEFAULT_DOMAIN = "<empty_domain>";

export async function screenshotCurrentTab(): Promise<string | undefined> {
    const originalWindow = await resizeWindow(COMPARABLE_WINDOW_WIDTH, COMPARABLE_WINDOW_HEIGHT);
    if (!originalWindow)
        return undefined;

    const imageUri = await browser.tabs.captureTab();
    downloadImageUri(imageUri);

    await resizeWindow(
        originalWindow.width ?? COMPARABLE_WINDOW_WIDTH,
        originalWindow.height ?? COMPARABLE_WINDOW_HEIGHT
    );

    return imageUri;
}

export async function currentDomain(): Promise<string> {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    const currentTab = tabs[0];
    if (!currentTab || !currentTab.url)
        return DEFAULT_DOMAIN;
    const hostname = new URL(currentTab.url).hostname;
    return !hostname ? DEFAULT_DOMAIN : hostname;
}

async function resizeWindow(width: number, height: number): Promise<Windows.Window | undefined> {
    const currentWindow = await browser.windows.getCurrent();
    if (currentWindow.id === undefined)
        return undefined;
    const updateInfo: Windows.UpdateUpdateInfoType = { width, height };
    await browser.windows.update(currentWindow.id, updateInfo);
    return currentWindow;
}

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

function downloadImageUri(imageUri: string): Promise<number> {
    const blob = convertBase64ToBlob(imageUri);
    return browser.downloads.download({
        url: URL.createObjectURL(blob),
        filename: "screenshot.png",
    });
}
