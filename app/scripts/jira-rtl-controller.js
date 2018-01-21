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
	return storage.merge(JiraURLsKey,domains);
    }
    removeUrl(domain){
	let storage = new st.ChromeSyncStorage();
	console.log("Removing url : ",domain);
	return storage.removeNested(JiraURLsKey,domain);
    }
    injectRtl(){
	chrome.tabs.insertCSS({file:"rtl.css"});
	chrome.tabs.executeScript(null, {file: 'load.js'});
    }
    getCurrentDomain(tabs){
	var tab = tabs[0];
	var url = tab.url;
	var oUrl = new URL(url)
	var domain = oUrl.hostname;
	return domain;
    }
    execInCurrentDomain(callback){
	chrome.tabs.query({
	    active: true,
	    currentWindow: true
	}, (tabs) => {
	    let domain = this.getCurrentDomain(tabs);
	    callback.call(this,domain);
	});
    }
    checkCurrentUrl(callback){
	this.execInCurrentDomain(function(currentHostname){
	    // let ctl = new JiraRtlController();
	    this.checkUrl(currentHostname).then((isUrlActive) => {
		callback.call(this,isUrlActive,currentHostname);
	    });
	});
    }
    iconOff(){
	chrome.browserAction.setIcon({
	    path:{
		"16": "images/jira-rtl-off-16x16.png",
		"48": "images/jira-rtl-off-48x48.png",
		"128": "images/jira-rtl-off-128x128.png"
	    }
	});
    }
    iconOn(){
	chrome.browserAction.setIcon({
	    path:{
		"16": "images/jira-rtl-16x16.png",
		"48": "images/jira-rtl-48x48.png",
		"128": "images/jira-rtl-128x128.png"
	    }
	});
    }
    drawIcon(){
	this.execInCurrentDomain(function(currentHostname){
	    // let ctl = new JiraRtlController();
	    this.checkUrl(currentHostname).then((isUrlActive) => {
		console.log("Is url active ",isUrlActive);
		if(isUrlActive){
		    console.log("Setting icon on");
		    this.iconOn();
		}else{
		    console.log("Setting icon off");
		    this.iconOff();
		}
	    });
	});
    }
}

module.exports = JiraRtlController;
