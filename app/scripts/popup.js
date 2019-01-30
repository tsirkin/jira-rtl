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
	    onColor:'success',
	    onText:'ON',
	    offColor:'default',
	    offText:'OFF',
	    onSwitchChange:switchRtl
	});
    });
});
