require('../css/rtl.css');
var $ = require("jquery");
var RtlWatcher = require("./rtl-watcher");
const RtlRegexp = require('unicode-10.0.0/Bidi_Class/Right_To_Left/regex.js');
const LtrRegexp = require('unicode-10.0.0/Bidi_Class/Left_To_Right/regex.js');

function wrapWithBdi (el){
    let parent = $(el).parent();
    if(parent && parent.prop("tagName") == "BDI"){
        return;
    }
    let tagName = $(el).prop("tagName");
    if(tagName == "LI"){
        setDirection(el);
        return;
    }
    $(el).wrap("<bdi></bdi>");
}

function setDirection(el){
    let tagName = $(el).prop("tagName");
    if(tagName == "LI"){
        let firstLI = $(el).parent().children().first();
        let dir = isRtlText(firstLI.text())?"rtl":"ltr";
        $(firstLI).css("direction",dir);
        return;
    }
    let text = $(el).text();
    if(!text) return;
    let dir = isRtlText(text)?"rtl":"ltr";
    $(el).css("direction",dir);
}

function setAlignment(el){
    let text = $(el).text();
    console.log("setting alignment for text ",text);
    if(!text) return;
    let dir = isRtlText(text)?"right":"left";
    $(el).css("text-align",dir);
}

const BLOCK_SEL = [
    "body p",
    "body li"
];

function isRtlText(text){
    if(!text || text.length == 0){
        return false;
    }
    for (let i=0;i < text.length;i++){
        let c = text.charAt(i);
        // TODO: probably should replace by object lookup to make it faster.
        if(RtlRegexp.test(c)){
            return true;
        }
        if(LtrRegexp.test(c)){
            return false;
        }
    }
    return false;
}

function setInputRtl(el){
    if(!$(el).val()) 
        return;
    if(isRtlText($(el).val())){
        console.log("Rtl in input");
        $(el).css("direction","rtl");
    }else{
        console.log("Ltr in input");
        $(el).css("direction","ltr");
    }
}

// function hintHebrew(el){
//     let text = $(el).text();
//     if(!text) return;
//     let dir = isRtlText(text)?"rtl":"ltr";
//     if($(el).prop("tagName") == "LI"){
//         $(el).parent().css("direction",dir);
//     }else
//         $(el).css("direction",dir);
// }

function wrapEditedWithBdi (el){
    let parent = $(el).parent();
    // If the elemnt was not already wrapped in bdi and there are no sibling block elements
    // if(parent && parent.prop("tagName") == "BDI" && siblings.length == 0){
    if(!el) return;
    if($(el).prop("tagName") == "BDI") return;
    if($(el).prop("tagName") == "LI"){
        setDirection(el);
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
            // console.log("No siblings found ");
            return;
        }
    }
    $(el).wrap("<bdi></bdi>");
}

function rtlEditedText(doc,mutations){
    // console.log("rtlEditedText called");
    // The body have id = tinymce
    // 1. Find all the <p> and wrap them inside <bdi> (done)
    // 2. Wait for any key press, llok for closest p and wrap it inside a bdi element.(todo)
    // The this will be automatically fixed by the RtlWatcher to be the watched DOM object.
    for (let sel of BLOCK_SEL){
        let ps = doc.querySelectorAll(sel);
        // console.log("mce selector "+sel);
        ps.forEach(el => {
            wrapEditedWithBdi(el);
        });
    }
}

function rtlMCE(){
    var iframes = document.querySelectorAll("iframe");
    iframes.forEach((ifrm) => {
        // console.log("ifrm : "+ifrm);
        var win = ifrm.contentWindow; // reference to iframe's window
        // reference to document in iframe
        try{
            var doc = ifrm.contentDocument || ifrm.contentWindow.document;
        }catch(e){
            // We don't have permissions to read the iframe (i.e. a cross site out of jira site).
            return;
        }
        var elMCE = doc.getElementById("tinymce");
        if(!elMCE) return;
        let watcher = new RtlWatcher();
        watcher.observe(doc.body,rtlEditedText);
    });
}

function rtlPage(doc){
    // console.log("rtlPage called");
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
    // Elements to be aligned to right
    let alignedSelectors = [
        // summary header
        "#summary-val",
        // dashboard summary
        "td.summary",
        // dashboard activity
        // TODO: looks like it does not work because that the description 
        // on dashboard is put inside inner iframe.
        "div.activity-item-description p",
    ];
    for (let sel of alignedSelectors){
        doc.querySelectorAll(sel).forEach((el) => setAlignment(el));
    }
    // Any editing event on input (removing click & propertychange)
    // $(document).on("propertychange change click keyup input paste","input",function(){
    $(document).on("change keyup input paste","input",function(){
        // console.log("Editing event on input elem");
        setInputRtl(this);
    });
    $("input").each(function(){
        setInputRtl(this);
    })
    rtlMCE();
    
};
// console.log("Loaded rtl");

class Rtl {
    startRtlWatching(){
        let watcher = new RtlWatcher();
        watcher.observe(document.body,rtlPage);
        rtlMCE();
    }
}

module.exports = Rtl;

