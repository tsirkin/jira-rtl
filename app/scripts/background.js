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
// React when a browser action's icon is clicked.
var JiraRtlController = require('./jira-rtl-controller');

// onDOMContentLoaded?
chrome.webNavigation.onCompleted.addListener(function (tab) {
    if (chrome.runtime.lastError) {
        console.log('problem with quering the tabs in onCompleted');
    }
    var url = tab.url;
    var oUrl = new URL(url)
    var domain = oUrl.hostname;
    console.log('In webNavigation.onCompleted');
    let ctl = new JiraRtlController();
    if (!url || !domain) return;
    ctl
        .onActiveUrl(domain)
        .then(function (urls) {
            // console.log('Url in list');
            ctl.injectRtl();
        });
    ctl.drawIcon();
});
chrome.tabs.onActivated.addListener(function (activeInfo) {
    // Need a timeout due to a known bug: https://stackoverflow.com/questions/67806779/im-getting-an-error-tabs-cannot-be-edited-right-now-user-may-be-dragging-a-ta
    if (chrome.runtime.lastError) {
        console.log('problem with quering the tabs in onActivated');
    }
    let ctl = new JiraRtlController();
    ctl.drawIcon();
    if (activeInfo.tabId) {
        ctl.checkCurrentUrl((isUrlActive, currentHostname) => {
            if (isUrlActive) {
                ctl.injectRtl();
            }
        });
    }
});
