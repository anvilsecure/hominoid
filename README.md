You can read more details about this proof of concept on the introductory blog post: 

https://www.anvilsecure.com/blog/silly-proof-of-concept-anti-phishing-using-perceptual-hashing-algorithms.html

# What is this?

A usable proof-of-concept for a browser extension that checks if a malicious site is trying to impersonate a valid one. 

Its main features are:

- Local database: there is no central database, all information is kept in the user’s browser.
- Work with what the user sees: Hominoid flags malicious sites that look similar to the real ones, regardless of their code.
- Private sites: as all computations are done in the user’s browser, there is no difference between public and private sites. All of them can be analyzed accordingly. 
- Better control: as the plugin resides in the user’s browser, it can be configured to analyze only pages with certain characteristics. For example a login form, a credit card field, etc.

# Getting Started

Run the following commands to install dependencies and start developing

```
yarn install
yarn dev
```

<details>
  <summary>Loading the extension in Google Chrome</summary>

In [Google Chrome](https://www.google.com/chrome/), open up [chrome://extensions](chrome://extensions) in a new tab. Make sure the `Developer Mode` checkbox in the upper-right corner is turned on. Click `Load unpacked` and select the `dist` directory in this repository - your extension should now be loaded.

![Installed Extension in Google Chrome](https://i.imgur.com/ORuHbDR.png "Installed Extension in Google Chrome")

</details>

<details>
  <summary>Loading the extension in Brave</summary>

In [Brave](https://brave.com/), open up [brave://extensions](brave://extensions) in a new tab. Make sure the `Developer Mode` checkbox in the upper-right corner is turned on. Click `Load unpacked` and select the `dist` directory in this repository - your extension should now be loaded.

![Installed Extension in Brave](https://i.imgur.com/z8lW02m.png "Installed Extension in Brave")

</details>

<details>
  <summary>Loading the extension in Mozilla Firefox</summary>

In [Mozilla Firefox](https://www.mozilla.org/en-US/firefox/new/), open up the [about:debugging](about:debugging) page in a new tab. Click the `Load Temporary Add-on...` button and select the `manfiest.json` from the `dist` directory in this repository - your extension should now be loaded.

![Installed Extension in Mozilla Firefox](https://i.imgur.com/gO2Lrb5.png "Installed Extension in Mozilla Firefox")

</details>
