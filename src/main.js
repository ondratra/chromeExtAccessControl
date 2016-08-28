"use strict";

import ChromeExtension from './extension.js';

window.chromeExtension = ChromeExtension.instance;

window.chromeExtension.run();
