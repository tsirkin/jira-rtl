var st = require("./chrome-storage");

const JiraURLsKey = "JiraURLsKey";


class JiraRtlController{
    constructor(){
    }
    onActiveUrl(domain){
	return new Promise((resolve) => {
	    let storage = new st.ChromeSyncStorage();
	    storage
		.get(JiraURLsKey)
		.then(function(urls) {
		    if(!urls || !urls[domain]) return;
		    resolve();
		});
	});
    }
    checkUrl(domain){
	return new Promise((resolve) => {
	    let storage = new st.ChromeSyncStorage();
	    storage
		.get(JiraURLsKey)
		.then(function(urls){
		    console.log("Looking for domain : ",domain);
		    console.log("Found urls %o : ",urls);
		    if(!urls){
			resolve(false);
			return;
		    }
		    let isUrlActive = (domain in urls);
		    resolve(isUrlActive);
		});
	});
    }
    storeUrl(domain){
	let storage = new st.ChromeSyncStorage();
	let domains = {};
	domains[domain] = true;
	storage.merge(JiraURLsKey,domains);
    }
    removeUrl(domain){
	let storage = new st.ChromeSyncStorage();
	console.log("Removing url : ",domain);
	storage.removeNested(JiraURLsKey,domain);
    }
    injectRtl(){
	chrome.tabs.insertCSS({file:"rtl.css"});
	chrome.tabs.executeScript(null, {file: 'load.js'});
    }
}

module.exports = JiraRtlController;
