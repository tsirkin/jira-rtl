var $ = require("jquery");
// var descElem = document.getElementById("description-val");
// var editor = require("jira/editor/tinymce");
// editor.remove();
// editor.init({
//     selector: "#description-val",  // change this value according to your HTML
//     plugins: "directionality",
//     toolbar: "ltr rtl"
// });
console.log("Loaded rtl");
function wrapWithBdi(el){
    $(el).wrap("<bdi></bdi>");
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
	// 1. Find all the <p> and wrap them inside <bdi>
	// 2. Wait for any key press, llok for closest p and wrap it inside a bdi element.
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

