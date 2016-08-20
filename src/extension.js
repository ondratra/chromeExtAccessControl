
import Singleton from './singleton.js';

export default class ChromeExtension extends Singleton {
    // set options here
    // chrome.storage.local.set({'myOptionKey': myOptionValue});

    run() {
        // load config and do something
        if (!chrome || !chrome.webRequest) {
            throw new Error('Chrome object not found. Is code runnig in browser?');
        }


        install();
    }

    install() {
        chrome.webRequest.onHeadersReceived.addListener(this.sendRequest);
        chrome.webRequest.onBeforeSendHeaders.addListener(this.recieveRequest);
    }

    uninstall() {
        chrome.webRequest.onHeadersReceived.removeListener(this.sendRequest);
        chrome.webRequest.onBeforeSendHeaders.removeListener(this.recieveRequest);
    }

    sendRequest() {

    }

    recieveRequest() {

    }
}
