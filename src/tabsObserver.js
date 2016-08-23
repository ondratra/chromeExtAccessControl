
import Singleton from './singleton.js';

// class pointing to all current browser tabs
// enables for example retrieving current url for each tab
export default class TabsObserver extends Singleton {

    constructor(lock) {
        super(lock);

        this.tabs = {};

        chrome.tabs.onUpdated.addListener((tabId, changeinfo, tab) => this.updateTabCallback(tabId, changeinfo, tab));
        chrome.tabs.onRemoved.addListener((tabId, removeinfo) => this.removeTabCallback(tabId, removeinfo));
    }

    updateTabCallback(tabId, changeinfo, tab) {
        this.tabs[tabId] = tab;
    }

    removeTabCallback(tabId, removeinfo) {
        delete this.tabs[tabId];
    };

    getTabUrl(tabId) {
        return this.tabs[tabId] ? this.tabs[tabId].url : null;
    }
}
