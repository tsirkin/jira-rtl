var $ = require("jquery");
var RtlWatcher = require("./rtl-watcher");

function wrapWithBdi (el){
    let parent = $(el).parent();
    if(parent && parent.prop("tagName") == "BDI"){
	return;
    }
    if($(el).prop("tagName") == "LI"){
	hintHebrew(el);
	return;
    }
    $(el).wrap("<bdi></bdi>");
}
const BLOCK_SEL = [
    "body p",
    "body li"
];

function hintHebrew(el){
    let text = $(el).text();
    if(!text) return;
    let isHeb = false;
    if(text.charCodeAt(0) >= 0x590 && text.charCodeAt(0) <= 0x5FF){
	isHeb = true;
    }
    if(!isHeb) return;
    if($(el).prop("tagName") == "LI"){
	$(el).parent().css("direction","rtl");
    }else
	$(el).css("direction","rtl");
}

function wrapEditedWithBdi (el){
    let parent = $(el).parent();
    // If the elemnt was not already wrapped in bdi and there are no sibling block elements
    // if(parent && parent.prop("tagName") == "BDI" && siblings.length == 0){
    if(!el) return;
    if($(el).prop("tagName") == "BDI") return;
    if($(el).prop("tagName") == "LI"){
	hintHebrew(el);
	return;
    }
    if($(el).prop("tagName") != "P" &&
       $(el).prop("tagName") != "LI" ) return;
    
    if(parent &&
       parent.prop("tagName") == "BDI"){
	let haveSiblings = false;
	// sibling paragraphs
	
	if($(el).siblings("P").length)
	    haveSiblings = true;
	if($(el).siblings("LI").length)
	    haveSiblings = true;
	    
	if(!haveSiblings){
	    console.log("No siblings found ");
	    return;
	}
    }
    $(el).wrap("<bdi></bdi>");
}

function rtlEditedText(doc,mutations){
    console.log("rtlEditedText called");
    // The body have id = tinymce
    // 1. Find all the <p> and wrap them inside <bdi> (done)
    // 2. Wait for any key press, llok for closest p and wrap it inside a bdi element.(todo)
    // The this will be automatically fixed by the RtlWatcher to be the watched DOM object.
    for (let sel of BLOCK_SEL){
	let ps = doc.querySelectorAll(sel);
	console.log("mce selector "+sel);
	ps.forEach(el => {
	    wrapEditedWithBdi(el);
	});
    }
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
	watcher.observe(doc.body,rtlEditedText);
    });
}

function rtlPage(doc){
    console.log("rtlPage called");
    doc.querySelectorAll(".editable-field").forEach((el) => {
	// Don't wrap a description-val as this is a mce editor's place.
	if(el.id && el.id == "description-val"){
	    return;
	}
	wrapWithBdi(el);
    });
    let selectors = [
	// discription p and li blocks
	".user-content-block p",
	".issue-link-summary",
	// dashboard summary
	"td.summary p",
	// summary header
	"#summary-val",
	// summary links to another tasks
	".link-summary",
	// TODO: the li block will have to be manually checked for the first character 
	".user-content-block li",
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
    // let hintSelectors = [
    // 	// TODO: the li block will have to be manually checked for the first character 
    // 	".user-content-block li",
    // ];
    // for (let sel of hintSelectors){
    // 	doc.querySelectorAll(sel).forEach((el) => hintHebrew(el));
    // }
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
	watcher.observe(document.body,rtlPage);
	rtlMCE();
    }
}

module.exports = Rtl;

