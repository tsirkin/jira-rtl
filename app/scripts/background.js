// React when a browser action's icon is clicked.
var st = require("./chrome-storage");

function injectRtl(){
    chrome.tabs.insertCSS({file:"rtl.css"});
    chrome.tabs.executeScript(null, {file: 'scripts/load.js'});
}

const JiraURLsKey = "JiraURLsKey";
// onDOMContentLoaded?
chrome.webNavigation.onCompleted.addListener(function(tab) {
    var url = tab.url;
    var oUrl = new URL(url)
    var domain = oUrl.hostname;
    console.log('In webNavigation.onCompleted');
    let storage = new st.ChromeSyncStorage();
    storage
	.get(JiraURLsKey)
	.then(function(urls) {
	    if(!url || !urls[domain]) return;
            console.log('Url in list');
	    injectRtl();
	});
});

chrome.browserAction.onClicked.addListener(function(tab) {
    var url = tab.url;
    var oUrl = new URL(url)
    var domain = oUrl.hostname;
    let storage = new st.ChromeSyncStorage();
    storage.merge(JiraURLsKey,{domain:true});
    injectRtl();
});
