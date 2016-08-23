
import Singleton from './singleton.js';
import TabsObserver from './tabsObserver.js';

const headers = {
    AccessControlAllowHeaders: 'Access-Control-Allow-Headers',
    AccessControlAllowOrigin: 'Access-Control-Allow-Origin',
    AccessControlRequestHeaders: 'Access-Control-Request-Headers',
    AccessControlAllowMethods: {
        'name': 'Access-Control-Allow-Methods',
        'value': 'GET, PUT, POST, DELETE, HEAD, OPTIONS'
    }
};

export default class ChromeExtension extends Singleton {
    // set options here
    // chrome.storage.local.set({'myOptionKey': myOptionValue});

    constructor(lock) {
        super(lock);

        this.resetRequestState();
        this.tabObserver = TabsObserver.instance;
    }

    resetRequestState() {
        this.accessControlPresent = null;
        this.sentFromUrl = null;
    }

    run() {
        // load config and do something
        if (!chrome || !chrome.webRequest) {
            throw new Error('Chrome object not found. Is code runnig in browser?');
        }


        this.install();
    }

    install() {
        const settings = {
            urls: ['*://*/*']
        };
        chrome.webRequest.onHeadersReceived.addListener((arg) => {return this.recieveResponse(arg)}, settings, ["blocking", "responseHeaders"]);
        chrome.webRequest.onBeforeSendHeaders.addListener((arg) => {return this.sendRequest(arg)}, settings, ["blocking", "requestHeaders"]);
    }

    uninstall() {
        chrome.webRequest.onHeadersReceived.removeListener(this.recieveResponse);
        chrome.webRequest.onBeforeSendHeaders.removeListener(this.sendRequest);
    }

    sendRequest(requestDetails) {
        let originHeaderExists = false;
        let ruleToEnsure = {
            name: "Origin",
            value: "http://domainMeantTo.pass/"
        };

        for (let headerRow of requestDetails.requestHeaders) {
            if (headerRow.name.toLowerCase() === ruleToEnsure.name.toLowerCase()) {
                originHeaderExists = true;
                headerRow.value = ruleToEnsure.value;
                //break;
            }

            if (headerRow.name.toLowerCase() === headers.AccessControlRequestHeaders.toLowerCase()) {
                this.accessControlPresent = headerRow.value;
            }
        }

        if (!originHeaderExists) {
            requestDetails.requestHeaders.push(ruleToEnsure);
        }

        let result = {
            requestHeaders: requestDetails.requestHeaders
        };

        this.sentFromUrl = this.tabObserver.getTabUrl(requestDetails.tabId);

        return result;
    }

    recieveResponse(responseDetails) {
        let originHeaderExists = false;
        let ruleToEnsure = {
            name: headers.AccessControlAllowOrigin,
            value: "*"
        };


        for (let headerRow of responseDetails.responseHeaders) {
            if (headerRow.name.toLowerCase() === ruleToEnsure.name.toLowerCase()) {
                originHeaderExists = true;
                headerRow.value = ruleToEnsure.value;
                break;
            }
        }

        if (!originHeaderExists) {
            responseDetails.responseHeaders.push(ruleToEnsure);
        }


        if (this.accessControlPresent) {
            responseDetails.responseHeaders.push({
                name: headers.AccessControlAllowHeaders,
                value: this.accessControlPresent
            });
        }

        responseDetails.responseHeaders.push(headers.AccessControlAllowMethods);

        let result = {
            responseHeaders: responseDetails.responseHeaders
        };

        this.resetRequestState();

        return result;
    }
}
