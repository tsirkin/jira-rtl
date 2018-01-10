// React when a browser action's icon is clicked.
chrome.browserAction.onClicked.addListener(function(tab) {
    // chrome.tabs.insertCSS({file:"conf-ar-space.css"});
    chrome.tabs.executeScript(null, {file: 'scripts/load.js'});
    
});
