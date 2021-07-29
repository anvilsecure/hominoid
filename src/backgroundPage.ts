import { browser } from "webextension-polyfill-ts";
// import { blockhashjs } from "blockhash";
import { DifferenceHashBuilder, Hash } from "browser-image-hash";

// console.log("Background starting");
// alert("Background starting");

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

browser.runtime.onMessage.addListener(async (request: { imageUri: string }) => {
    const imageUri = request.imageUri;
    if (imageUri != undefined) {
        // downloadImageUri(imageUri);

        const currentHash = await new DifferenceHashBuilder().build(new URL(imageUri));
        console.log({ currentHash });

        const srcHash = new Hash("0000001010100111111111011111111111111111111111111111111111111111");
        const result = srcHash.getHammingDistance(currentHash) <= 10;
        console.log(result);
        return result;
    }
});
