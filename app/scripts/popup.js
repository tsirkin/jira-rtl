require('../css/popup.css');
require('../../node_modules/bootstrap-switch/dist/css/bootstrap3/bootstrap-switch.css');
var $ = require("jquery");
require("bootstrap-switch");
var JiraRtlController = require('./jira-rtl-controller');

// Called when the user clicks on the browser action.
document.addEventListener('DOMContentLoaded', function () {
    console.log("popup content loaded");
    function getCurrentDomain(tabs){
	var tab = tabs[0];
	var url = tab.url;
	var oUrl = new URL(url)
	var domain = oUrl.hostname;
	return domain;
    }
    function execInCurrentDomain(callback){
	chrome.tabs.query({
	    active: true,
	    currentWindow: true
	}, function(tabs) {
	    let domain = getCurrentDomain(tabs);
	    callback.call(window,domain);
	});
    }
    function switchRtl(ev,state){
	let ctl = new JiraRtlController();
	// TODO: also use chrome.browserAction.setIcon({path: icon}); to set the enabled/disabled icon.
	if(state){
	    execInCurrentDomain(function(domain){
		console.log("Storing url : ",domain);
		ctl.storeUrl(domain);
		ctl.injectRtl();
	    });
	}else{
	    execInCurrentDomain(function(domain){
		ctl.removeUrl(domain);
	    });
	}
    }
    var toggleBtn = $("#enable-jira-rtl");
    execInCurrentDomain(function(domain){
	let ctl = new JiraRtlController();
	ctl.checkUrl(domain).then(function(isUrlActive){
	    toggleBtn.bootstrapSwitch({
		state: !isUrlActive,
		size:'small',
		onColor:'success',
		offColor:'danger',
		onSwitchChange:switchRtl
	    });
	});
    });
});
