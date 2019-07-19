var port = browser.runtime.connectNative("siguranta");

port.onMessage.addListener((obj) => {
  console.log("RESULT: " + obj["result"]);
});

function onCaptured(img) {
  var url = "https://test.com";
  var message = {"url":url, "img":img};
  port.postMessage(message);
}

function onError(error) {
  console.log("Error: ${error}");
}

browser.browserAction.onClicked.addListener(() => {
  var capturing = browser.tabs.captureVisibleTab();
  capturing.then(onCaptured, onError);
});
