import { browser } from "webextension-polyfill-ts";
// import { DifferenceHashBuilder, Hash } from "browser-image-hash";

// console.log("Background starting");
// alert("Background starting");

function convertBase64ToBlob(base64String: string): Blob {
    const arr = base64String.split(",") ?? [];
    if (arr === null || arr.length < 2) return new Blob();
    else {
        const mime = ((arr[0] ?? "").match(/:(.*?);/) ?? [])[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const uint8Array = new Uint8Array(n);
        while (n--) {
            uint8Array[n] = bstr.charCodeAt(n);
        }
        return new Blob([uint8Array], { type: mime });
    }
}

// Listen for messages sent from other parts of the extension
browser.runtime.onMessage.addListener((request: { popupMounted: boolean }) => {
    // Log statement if request.popupMounted is true
    // NOTE: this request is sent in `popup/component.tsx`
    if (request.popupMounted) {
        console.log("backgroundPage notified that Popup.tsx has mounted.");
    }
});

browser.runtime.onMessage.addListener((request: { imageUri: string }) => {
    if (request.imageUri != undefined) {
        const blob = convertBase64ToBlob(request.imageUri);
        browser.downloads.download({
            url: URL.createObjectURL(blob),
            filename: "screenshot.png",
        });
    }
});

// document.addEventListener("DOMContentLoaded", async () => {
//     alert(111);
//     // const builder = new DifferenceHashBuilder();
//     // const targetURL = new URL("./example.jpg", window.location.href);
//     // const destHash = await builder.build(targetURL);
//     // const srcHash = new Hash(
//     //     "0111011001110000011110010101101100110011000100110101101000111000",
//     // );

//     // if (srcHash.getHammingDistance(destHash) <= 10) {
//     //     console.log("Resembles");
//     //     return;
//     // }

//     console.log("Different");
// });

// console.log("Background worker started");
// alert("Background worker started");
