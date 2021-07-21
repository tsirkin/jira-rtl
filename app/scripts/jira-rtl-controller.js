/**
    This file is part of JiraRTL Chrom plugin.
    Copyright (C)Evgeny Tsirkin

    JiraRTL is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    JiraRTL is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of 
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Foobar.  If not, see <https://www.gnu.org/licenses/>.
 */

var st = require("./chrome-storage");

const JiraURLsKey = "JiraURLsKey";


class JiraRtlController {
    constructor() {
    }
    onActiveUrl(domain) {
        return new Promise((resolve) => {
            let storage = new st.ChromeSyncStorage();
            storage
                .get(JiraURLsKey)
                .then(function (urls) {
                    if (!urls || !urls[domain]) return;
                    resolve();
                });
        });
    }
    checkUrl(domain) {
        return new Promise((resolve) => {
            let storage = new st.ChromeSyncStorage();
            storage
                .get(JiraURLsKey)
                .then(function (urls) {
                    if (!urls) {
                        resolve(false);
                        return;
                    }
                    let isUrlActive = (domain in urls);
                    resolve(isUrlActive);
                });
        });
    }
    storeUrl(domain) {
        let storage = new st.ChromeSyncStorage();
        let domains = {};
        domains[domain] = true;
        return storage.merge(JiraURLsKey, domains);
    }
    removeUrl(domain) {
        let storage = new st.ChromeSyncStorage();
        return storage.removeNested(JiraURLsKey, domain);
    }
    injectRtl() {
        chrome.tabs.insertCSS({ file: "rtl.css" });
        chrome.tabs.executeScript(null, { file: 'load.js' });
    }
    getCurrentDomain(tabs) {
        if (!tabs) return;
        var tab = tabs[0];
        var url = tab.url;
        try {
            var oUrl = new URL(url)
            var domain = oUrl.hostname;
            return domain;
        } catch (e) {
            return ""
        }
    }
    execInCurrentDomain(callback) {
        let that = this;
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, (tabs) => {
            if (chrome.runtime.lastError) {
                console.log('problem with quering the tabs in execInCurrentDomain');
                setTimeout(() => {
                    that.execInCurrentDomain(callback)
                }, 100);
            }
            let domain = this.getCurrentDomain(tabs);
            if (domain) {
                callback.call(this, domain);
            }
        });
    }
    checkCurrentUrl(callback) {
        this.execInCurrentDomain(function (currentHostname) {
            // let ctl = new JiraRtlController();
            this.checkUrl(currentHostname).then((isUrlActive) => {
                callback.call(this, isUrlActive, currentHostname);
            });
        });
    }
    iconOff() {
        chrome.browserAction.setIcon({
            path: {
                "16": "images/jira-rtl-off-16x16.png",
                "48": "images/jira-rtl-off-48x48.png",
                "128": "images/jira-rtl-off-128x128.png"
            }
        });
    }
    iconOn() {
        chrome.browserAction.setIcon({
            path: {
                "16": "images/jira-rtl-16x16.png",
                "48": "images/jira-rtl-48x48.png",
                "128": "images/jira-rtl-128x128.png"
            }
        });
    }
    drawIcon() {
        this.execInCurrentDomain(function (currentHostname) {
            // let ctl = new JiraRtlController();
            this.checkUrl(currentHostname).then((isUrlActive) => {
                console.log("Is url active ", isUrlActive);
                if (isUrlActive) {
                    console.log("Setting icon on");
                    this.iconOn();
                } else {
                    console.log("Setting icon off");
                    this.iconOff();
                }
            });
        });
    }
}

module.exports = JiraRtlController;
