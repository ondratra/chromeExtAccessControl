
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

    constructor(lock) {
        super(lock);

        this.runningRequestData = {};
        this.tabObserver = TabsObserver.instance;

        // default settings
        // pairs of [fromUrlRegexp, toUrlRegexp]
        this.rules = [
            ['^.*:\/\/.*\/.*$', '^.*:\/\/.*\/.*$'] // from "everywhere" to "everywhere"
        ];
        this.logRecords = [];
    }

    run() {
        // load config and do something
        if (!chrome || !chrome.webRequest) {
            throw new Error('Chrome object not found. Is code runnig in browser?');
        }

        this.install();
    }

    // used by gui
    setRules(newRules) {
        this.rules = newRules;
    }

    install() {
        const settings = {
            urls: ['*://*/*']
        };
        chrome.webRequest.onHeadersReceived.addListener((arg) => {return this.recieveResponse(arg)}, settings, ["blocking", "responseHeaders"]);
        chrome.webRequest.onBeforeSendHeaders.addListener((arg) => {return this.sendRequest(arg)}, settings, ["blocking", "requestHeaders"]);
    }

    log(msg, values = undefined) {
        this.logRecords.push([msg, values]);
    }

    // used by gui
    getLogRecords() {
        return this.logRecords;
    }

    someRuleApply(fromUrl, toUrl) {
        for (let [fromUrlRegexp, toUrlRegexp] of this.rules) {
            let tmpFrom = new RegExp(fromUrlRegexp);
            let tmpTo = new RegExp(toUrlRegexp);

            if (tmpFrom.test(fromUrl) && tmpTo.test(toUrl)) {
                return true;
            }
        }

        return false;
    }

    sendRequest(requestDetails) {
        // create request info record
        this.runningRequestData[requestDetails.requestId] = {};

        let fromUrl = this.tabObserver.getTabUrl(requestDetails.tabId);
        this.runningRequestData[requestDetails.requestId].sentFromUrl = fromUrl;
        let someRuleApply = this.someRuleApply(fromUrl, requestDetails.url);
        this.log('sendRequest_start', [requestDetails, someRuleApply]);

        if (someRuleApply) {
            let originHeaderExists = false;
            let ruleToEnsure = {
                name: "Origin",
                value: "http://domainMeantTo.pass/"
            };

            for (let headerRow of requestDetails.requestHeaders) {
                if (headerRow.name.toLowerCase() === ruleToEnsure.name.toLowerCase()) {
                    originHeaderExists = true;
                    headerRow.value = ruleToEnsure.value;
                }

                if (headerRow.name.toLowerCase() === headers.AccessControlRequestHeaders.toLowerCase()) {
                    this.runningRequestData[requestDetails.requestId].accessControlPresent = headerRow.value;
                }
            }

            if (!originHeaderExists) {
                requestDetails.requestHeaders.push(ruleToEnsure);
            }
        }

        let result = {
            requestHeaders: requestDetails.requestHeaders
        };
        this.log('sendRequest_end', [result]);

        return result;
    }

    recieveResponse(responseDetails) {
        let someRuleApply = this.someRuleApply(this.runningRequestData[responseDetails.requestId].sentFromUrl, responseDetails.url);
        this.log('recieveResponse_start', [responseDetails, someRuleApply]);

        if (someRuleApply) {
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

            if (this.runningRequestData[responseDetails.requestId].accessControlPresent) {
                responseDetails.responseHeaders.push({
                    name: headers.AccessControlAllowHeaders,
                    value: this.runningRequestData[responseDetails.requestId].accessControlPresent
                });
            }

            responseDetails.responseHeaders.push(headers.AccessControlAllowMethods);
        }

        let result = {
            responseHeaders: responseDetails.responseHeaders
        };
        delete this.runningRequestData[responseDetails.requestId]; // request completed => delete request data
        this.log('recieveResponse_end', [result]);

        return result;
    }
}
