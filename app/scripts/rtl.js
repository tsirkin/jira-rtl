var $ = require("jquery");
var RtlWatcher = require("./rtl-watcher");

module.exports = new Rtl();

function wrapWithBdi (el){
    let parent = $(el).parent();
    if(parent && parent.prop("tagName") == "BDI"){
	return;
    }
    $(el).wrap("<bdi></bdi>");
}

function rtlEditedText(doc,mutations){
    // The body have id = tinymce
    // 1. Find all the <p> and wrap them inside <bdi> (done)
    // 2. Wait for any key press, llok for closest p and wrap it inside a bdi element.(todo)
    // The this will be automatically fixed by the RtlWatcher to be the watched DOM object.
    var ps = doc.querySelectorAll("body p");
    ps.forEach((el) => {
	console.log(el);
	wrapWithBdi(el);
    });
}
function rtlMCE(){
    var iframes = document.querySelectorAll("iframe");
    iframes.forEach((ifrm) => {
	console.log("ifrm : "+ifrm);
	var win = ifrm.contentWindow; // reference to iframe's window
	// reference to document in iframe
	var doc = ifrm.contentDocument? ifrm.contentDocument: ifrm.contentWindow.document;
	var elMCE = doc.getElementById("tinymce");
	if(!elMCE) return;
	let watcher = new RtlWatcher();
	watcher.observe(doc,rtlEditedText);
    });
}

function rtlPage(doc){
    doc.querySelectorAll(".editable-field").forEach((el) => {
	// Don't wrap a description-val as this is a mce editor's place.
	if(el.id && el.id == "description-val"){
	    return;
	}
	wrapWithBdi(el);
    });
    let selectors = [
	".user-content-block p",
	".issue-link-summary",
	// dashboard summary
	"td.summary p",
	// summary links to another tasks
	".link-summary",
	// issue links (e.g. linked epics)
	".issue-link",
	// comment
	// TODO: we should *in global case* take care of both p and ul tags
	".action-body p",
	".action-body ul",
    ];
    for (let sel of selectors){
	doc.querySelectorAll(sel).forEach((el) => wrapWithBdi(el));
    }   
    $("#description-val").on("click",function(e){
	console.log("descr clicked");
	// $("#tinymce").find("p").each(el  => wrapWithBdi(el));
	// wrapWithBdi($(this).find("p"));
	rtlMCE();
    });
    
    
    // log
    // TODO: the new/old do not work as those are td elements which discards bdi
    // should wrap the inside text in div that takes the whole td space and set the bdi on this.
    // $(".activity-new-val").each((idx,el) => {
    //     wrapWithInnerBdi(el);
    // });
};
console.log("Loaded rtl");

class Rtl {
    startRtlWatching(){
	let watcher = new RtlWatcher();
	watcher.observe(document,rtlPage);
	rtlMCE();
    }
}

