var $ = require("jquery");

console.log("Loaded rtl");
function wrapWithBdi(el){
    $(el).wrap("<bdi></bdi>");
}
function wrapWithInnerBdi(el){
    $(el).wrapInner("<bdi></bdi>");
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
	// The body have id = tinymce
	// 1. Find all the <p> and wrap them inside <bdi> (done)
	// 2. Wait for any key press, llok for closest p and wrap it inside a bdi element.(todo)
	var ps = doc.querySelectorAll("body p");
	ps.forEach((el) => {
	    console.log(el);
	    wrapWithBdi(el);
	});
    });
}


// TODO: if certain tab have already converted the hebrew don't do it again.
$(".editable-field").each((idx,el) => {
    if($(el).attr("id") == "description-val"){
	return;
    }
    // Don't wrap a description-val as this is a mce editor's place.
    wrapWithBdi(el)
});

$(".user-content-block p").each((idx,el) => {
    wrapWithBdi(el);
});

$("#description-val").on("click",function(e){
    console.log("descr clicked");
    // $("#tinymce").find("p").each(el  => wrapWithBdi(el));
    // wrapWithBdi($(this).find("p"));
    rtlMCE();
});

$(".issue-link-summary").each((idx,el) => {
    wrapWithBdi(el);
});
// dashboard summary
$("td.summary p").each((idx,el) => {
    wrapWithBdi(el);
});

// summary links to another tasks
$(".link-summary").each((idx,el) => {
    wrapWithBdi(el);
});
// issue links (e.g. linked epics)
$(".issue-link").each((idx,el) => {
    wrapWithBdi(el);
});
// log
// TODO: the new/old do not work as those are td elements which discards bdi
// should wrap the inside text in div that takes the whole td space and set the bdi on this.
// $(".activity-new-val").each((idx,el) => {
//     wrapWithInnerBdi(el);
// });
// comment
// TODO: we should *in global case* take care of both p and ul tags
$(".action-body p").each((idx,el) => {
    wrapWithBdi(el);
});

$(".action-body ul").each((idx,el) => {
    wrapWithBdi(el);
});
