var scriptEl = document.getElementById("jira-rtl-script");
if(!scriptEl){
    var s = document.createElement('script');
    // TODO: add "script.js" to web_accessible_resources in manifest.json
    s.src = chrome.extension.getURL('scripts/rtl.js');
    s.onload = function() {
	this.remove();
    };
    (document.head || document.documentElement).appendChild(s);
}
