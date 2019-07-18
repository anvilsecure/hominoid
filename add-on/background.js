var port = browser.runtime.connectNative("siguranta");

port.onMessage.addListener((response) => {
  console.log("Received: " + response);
});

function onCaptured(imageUri) {
  console.log("Sending:  ping: " + imageUri);
  port.postMessage(imageUri);
}

function onError(error) {
  console.log("Error: ${error}");
}

browser.browserAction.onClicked.addListener(() => {
  var capturing = browser.tabs.captureVisibleTab();
  capturing.then(onCaptured, onError);
});
