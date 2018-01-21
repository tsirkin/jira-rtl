require('../css/popup.css');
require('../../node_modules/bootstrap-switch/dist/css/bootstrap3/bootstrap-switch.css');
var $ = require("jquery");
require("bootstrap-switch");
var JiraRtlController = require('./jira-rtl-controller');

// Called when the user clicks on the browser action.
document.addEventListener('DOMContentLoaded', function () {
    console.log("popup content loaded");
    function switchRtl(ev,state){
	let ctl = new JiraRtlController();
	if(state){
	    ctl.execInCurrentDomain(async function(domain){
		// console.log("Storing url : ",domain);
		await ctl.storeUrl(domain);
		ctl.injectRtl();
		ctl.drawIcon()
	    });
	}else{
	    ctl.execInCurrentDomain(async function(domain){
		await ctl.removeUrl(domain);
		ctl.drawIcon()
	    });
	}
    }
    var toggleBtn = $("#enable-jira-rtl");
    let ctl = new JiraRtlController();
    ctl.checkCurrentUrl((isUrlActive,currentHostname) => {
	console.log("Showing toggle button with state ",isUrlActive);
	// Note that the button text/color is the opposite from the default
	// as showing 'On' means that the plugin is Off for the current moment.
	toggleBtn.bootstrapSwitch({
	    state: isUrlActive,
	    size:'small',
	    onColor:'danger',
	    onText:'Off',
	    offColor:'success',
	    offText:'On',
	    onSwitchChange:switchRtl
	});
    });
});
