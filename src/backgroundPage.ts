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

async function calculateHash(imageUri: string): Promise<Hash> {
    const builder = new DifferenceHashBuilder();
    return builder.build(new URL(imageUri));
}

browser.runtime.onMessage.addListener(async (request: { imageUri: string }) => {
    const imageUri = request.imageUri;
    if (imageUri != undefined) {
        // downloadImageUri(imageUri);

        const currentHash = await calculateHash(imageUri);
        console.log({ currentHash });

        const srcHash = new Hash("0000001010100111111111011111111111111111111111111111111111111111");
        const result = srcHash.getHammingDistance(currentHash) <= 10;
        console.log(result);
        return result;
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
