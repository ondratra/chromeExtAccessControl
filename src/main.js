"use strict";

import ChromeExtension from './extension.js';

chrome.runtime.onInstalled.addListener(function () {
    ChromeExtension.instance.run();
});
