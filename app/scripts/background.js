// React when a browser action's icon is clicked.

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
    chrome.storage.sync.get(JiraURLsKey,function(oUrls) {
	let urls = oUrls[JiraURLsKey];
	if (Object.keys(urls).length > 0) {
	    // Already there
	    if(!urls[domain]) return;
	} 
        console.log('Url in list');
	injectRtl();
    });
});

chrome.browserAction.onClicked.addListener(function(tab) {
    var url = tab.url;
    var oUrl = new URL(url)
    var domain = oUrl.hostname;
    chrome.storage.sync.get(JiraURLsKey,function(oUrls) {
	let urls = oUrls[JiraURLsKey];
	if (Object.keys(urls).length > 0) {
	    // Already there
	    if(urls[domain]) return;
	} else {
            // The urls list doesn't exist yet, create it
            urls = {};
	}
	urls[domain] = true;
	let storage = {};
	storage[JiraURLsKey] = urls;
	// Now save the updated items using set
	chrome.storage.sync.set(storage, function() {
	    // console.log("object %o stored successfully",storage);
	});
    });
    injectRtl();
});
