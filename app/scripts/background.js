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
    var bkg = chrome.extension.getBackgroundPage();
    chrome.storage.sync.get(JiraURLsKey,function(urls) {
	if (Object.keys(urls).length > 0) {
	    // Already there
	    alert(urls[domain]);
	    if(!urls[domain]) return;
	} 
        bkg.console.log('Url in list');
	injectRtl();
    });
});

chrome.browserAction.onClicked.addListener(function(tab) {
    var url = tab.url;
    var oUrl = new URL(url)
    var domain = oUrl.hostname;
    // TODO: save the url
    chrome.storage.sync.get(JiraURLsKey,function(urls) {
	if (Object.keys(urls).length > 0) {
	    // Already there
	    if(urls[domain]) return;
	} else {
            // The data array doesn't exist yet, create it
            urls = {};
	}
	urls[domain] = true;
	let storage = {};
	storage[JiraURLsKey] = urls;
	// Now save the updated items using set
	chrome.storage.sync.set(storage, function() {
            //alert('Url successfully saved');
	});
    });
    injectRtl();
});
