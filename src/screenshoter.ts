// import { DifferenceHashBuilder, Hash } from "browser-image-hash";
// import { blockhashjs } from "blockhash";

console.log("Screenshoter  starting");

try {
    console.log("calculateHash starting");

    // const blockhash = blockhashjs.blockhash;
    // blockhash.

    // const builder = new DifferenceHashBuilder();
    // const targetURL = new URL(window.location.href);
    // builder
    //     .build(targetURL)
    //     .then((destHash: Hash) => {
    //         const srcHash = new Hash(
    //             "0111011001110000011110010101101100110011000100110101101000111000",
    //         );
    //         if (srcHash.getHammingDistance(destHash) <= 10) {
    //             console.log("Resembles");
    //             alert("Resembles");
    //         } else {
    //             console.log("Different");
    //             alert("Different");
    //         }
    //     })
    //     .catch((reason) => {
    //         console.log(reason);
    //         alert(reason);
    //     });
} catch (error) {
    console.log(error);
    alert(error);
}

console.log("Screenshoter ending");
