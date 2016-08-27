"use strict";

import ChromeExtension from './extension.js';

window.chromeExtension = ChromeExtension.instance;

chrome.runtime.onInstalled.addListener(function () {
    window.chromeExtension.run();
});
