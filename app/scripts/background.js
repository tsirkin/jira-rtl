// React when a browser action's icon is clicked.
var JiraRtlController = require('./jira-rtl-controller');

// onDOMContentLoaded?
chrome.webNavigation.onCompleted.addListener(function(tab) {
    var url = tab.url;
    var oUrl = new URL(url)
    var domain = oUrl.hostname;
    console.log('In webNavigation.onCompleted');
    let ctl = new JiraRtlController();
    if(!url || !domain) return;
    ctl
	.onActiveUrl(domain)
	.then(function(urls) {
            console.log('Url in list');
	    ctl.injectRtl();
	    // TODO: also use chrome.browserAction.setIcon({path: icon}); to set the enabled/disabled icon.
	});
    ctl.drawIcon();
});

// chrome.browserAction.onClicked.addListener(function(tab) {
//     var url = tab.url;
//     var oUrl = new URL(url)
//     var domain = oUrl.hostname;
//     let ctl = new st.JiraRtlController();
//     ctl.storeUrl(domain);
//     injectRtl();
// });
