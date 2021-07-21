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

require('../css/rtl.css');
let styleLib = require('./style');
var $ = require("jquery");
var RtlWatcher = require("./rtl-watcher");
const RtlRegexp = require('unicode-10.0.0/Bidi_Class/Right_To_Left/regex.js');
const LtrRegexp = require('unicode-10.0.0/Bidi_Class/Left_To_Right/regex.js');
window.cssRuleCount = 0;

function wrapWithBdi(el) {
    let parent = $(el).parent();
    if (parent && parent.prop("tagName") == "BDI") {
        return;
    }
    let tagName = $(el).prop("tagName");
    if (tagName == "LI") {
        setDirection(el);
        return;
    }
    if (shouldSkipNode(el)) return;
    $(el).wrap("<bdi></bdi>");
}

function setAutoDirection(el) {
    // unset theany alignment already applied
    let tagName = $(el).prop("tagName");
    console.log("tag name in setAutoDirection %o", tagName)
    $(el).css("text-align", "initial");
    // set auto direction
    $(el).attr("dir", "auto");
}

function setDirection(el) {
    let tagName = $(el).prop("tagName");
    console.log("tag name in setDirection %o", tagName)
    if (tagName == "LI") {
        let firstLI = $(el).parent().children().first();
        let dir = isRtlText(firstLI.text()) ? "rtl" : "ltr";
        $(firstLI).css("direction", dir);
        $(firstLI).parent().css("direction", dir);
        return;
    }
    let text = $(el).text();
    if (!text) return;
    if (shouldSkipNode(el)) return;
    let dir = isRtlText(text) ? "rtl" : "ltr";
    $(el).css("direction", dir);
}

/**
 * Should skip the node e.g. ProseMirror editor children.
 * @param {Element} el 
 */
function shouldSkipNode(el) {
    return $(el).closest('.ProseMirror').length > 0;
}

/**
 * While setting direction in ProseMirror take extra care by not changing the direction
 * of the paragraph but by changing the nth child, else prose mirror will trigger node
 * addition.
 */
function setProseMirrorDirection() {
    //debugger
    // For each P inside ProseMirror that needs RTL
    // Check if there is a prose mirror rule already, create if needed and apply to the ProseMirror element
    $('.ProseMirror').each((idx, el) => {
        //$('#jira-rtl-prose-mirror').remove()
        let clazz = `jira-rtl-prose-mirror-${idx}`;
        // remove prev. class, editors can be added dynamically - 
        // having more then 100 editors would be insane.
        for (let i = 0; i < 100; i++) {
            if ($(el).hasClass(`jira-rtl-prose-mirror-${i}`)) {
                $(el).removeClass(`jira-rtl-prose-mirror-${i}`)
            }
        }
        if (!$(el).hasClass(clazz)) {
            $(el).addClass(clazz)
        }

        $(el).find('p').each((pidx, pel) => {
            let text = $(pel).text();
            let childSelector = `.${clazz}.ProseMirror p:nth-child(${pidx + 1})`;
            if (!text) {
                styleLib.removeRule("jira-rtl-prose-mirror", childSelector);
                return;
            };
            if (isRtlText(text)) {
                styleLib.addRuleIfNotExists("jira-rtl-prose-mirror", {
                    selector: childSelector,
                    styles: [['direction', 'rtl']]
                })
            } else {
                styleLib.removeRule("jira-rtl-prose-mirror", childSelector);
            }
        })

    })
}

function setAlignment(el) {
    let text = $(el).text();
    // console.log("setting alignment for text ",text);
    let tagName = $(el).prop("tagName");
    if (!text) return;
    let dir = isRtlText(text) ? "right" : "left";
    $(el).css("text-align", dir);
}

function setWidth(el) {
    $(el).css("width", "100%");
}

const BLOCK_SEL = [
    "body p",
    "body li"
];

function isRtlText(text) {
    if (!text || text.length == 0) {
        return false;
    }
    for (let i = 0; i < text.length; i++) {
        let c = text.charAt(i);
        // TODO: probably should replace by object lookup to make it faster.
        if (RtlRegexp.test(c)) {
            return true;
        }
        if (LtrRegexp.test(c)) {
            return false;
        }
    }
    return false;
}

function setInputRtl(el) {
    let tagName = $(el).prop("tagName");
    console.log("tag name in setInputRtl %o", tagName)
    if (!$(el).val())
        return;
    if (isRtlText($(el).val())) {
        $(el).css("direction", "rtl");
    } else {
        $(el).css("direction", "ltr");
    }
}

function wrapEditedWithBdi(el) {
    let parent = $(el).parent();
    // If the elemnt was not already wrapped in bdi and there are no sibling block elements
    // if(parent && parent.prop("tagName") == "BDI" && siblings.length == 0){
    if (!el) return;
    if ($(el).prop("tagName") == "BDI") return;
    if ($(el).prop("tagName") == "LI") {
        setDirection(el);
        return;
    }
    if ($(el).prop("tagName") != "P" &&
        $(el).prop("tagName") != "LI") return;

    let tagName = $(el).prop("tagName");
    if (shouldSkipNode(el)) return;
    if (parent &&
        parent.prop("tagName") == "BDI") {
        let haveSiblings = false;
        // sibling paragraphs

        if ($(el).siblings("P").length)
            haveSiblings = true;
        if ($(el).siblings("LI").length)
            haveSiblings = true;

        if (!haveSiblings) {
            // console.log("No siblings found ");
            return;
        }
    }
    $(el).wrap("<bdi></bdi>");
}

function rtlEditedText(doc, mutations) {
    // console.log("rtlEditedText called");
    // The body have id = tinymce
    // 1. Find all the <p> and wrap them inside <bdi> (done)
    // 2. Wait for any key press, llok for closest p and wrap it inside a bdi element.(todo)
    // The this will be automatically fixed by the RtlWatcher to be the watched DOM object.
    for (let sel of BLOCK_SEL) {
        let ps = doc.querySelectorAll(sel);
        // console.log("mce selector "+sel);
        ps.forEach(el => {
            wrapEditedWithBdi(el);
        });
    }
}

function rtlIframe(docBody) {
    var iframes = docBody.querySelectorAll("iframe");
    iframes.forEach((ifrm) => {
        // console.log("ifrm : "+ifrm);
        var win = ifrm.contentWindow; // reference to iframe's window
        // reference to document in iframe
        let iframeDoc;
        try {
            iframeDoc = ifrm.contentDocument || ifrm.contentWindow.document;
        } catch (e) {
            // We don't have permissions to read the iframe (i.e. a cross site out of jira site).
            return;
        }
        let watcher = new RtlWatcher();
        var elMCE = iframeDoc.getElementById("tinymce");
        if (elMCE) {
            watcher.observe(iframeDoc.body, rtlEditedText);
        } else {
            watcher.observe(iframeDoc.body, rtlPage);
        }
    });
}

function rtlPage(docBody) {
    console.log("rtlPage called");
    docBody.querySelectorAll(".editable-field").forEach((el) => {
        // Don't wrap a description-val as this is a mce editor's place.
        if (el.id && el.id == "description-val") {
            return;
        }
        wrapWithBdi(el);
    });
    let selectors = [
        // discription p and li blocks
        ".user-content-block p",
        ".issue-link-summary",
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
        // in new jira cloud the main issue body
        ".ak-renderer-document p",
        // kanban popup with issue content in new cloud gui
        '[role="presentation"] p'
    ];
    for (let sel of selectors) {
        docBody.querySelectorAll(sel).forEach((el) => wrapWithBdi(el));
    }
    let directionSelectors = [
        // Issue in Kanban view
        ".ghx-summary",
        ".ghx-summary .ghx-inner",
        //
        "h1",
        // bad, as there is a <p> in prose mirror editor which will end up as endless loop
        "p"
    ];
    for (let sel of directionSelectors) {
        docBody.querySelectorAll(sel).forEach((el) => setDirection(el));
    }
    // Elements to be aligned to right
    let alignedSelectors = [
        // summary header
        // "#summary-val", - it is better to center this with h1 tag style
        // dashboard summary paragraph
        "td.summary p",
        // dashboard summary
        "td.summary",
        // dashboard activity
        // TODO: looks like it does not work because that the description 
        // on dashboard is put inside inner iframe.
        "div.activity-item-description p",
        // Epic link
        // ".aui-label.ghx-label-3"
        ".aui-label",
        // Not editable epic lable
        ".type-gh-epic-label",
        // Disabled custom fields
        ".editable-field.inactive .shorten",
        ".editable-field.inactive",
        // Issues in Epic
        ".nav.ghx-summary",
        // Issue in Kanban view
        ".ghx-summary",
        ".ghx-summary .ghx-inner",
        // cloud installation issues table
        '[data-testid="native-issue-table.ui.issue-row"] td'
    ];
    for (let sel of alignedSelectors) {
        docBody.querySelectorAll(sel).forEach(function (el) {
            setAutoDirection(el);
            // note that we first set the direction that will also change the
            // text-align to auto by default and then check if there is rtl text
            // to set the text-align to right
            setAlignment(el);
        });
    }
    $("textarea").each(function (i, el) {
        setAutoDirection(this);
        return true;
    });
    // fix custom fields alignment
    $("[id^='customfield_']").each(function (i, el) {
        if (this.nodeType == Node.TEXT_NODE) {
            wrapWithBdi(this);
            return true;
        }
        $(el).find(".flooded").each(function () {
            wrapWithBdi(this);
        })
    })
    let alignCenterSelectors = [
        "h1",
    ];
    for (let sel of alignCenterSelectors) {
        docBody.querySelectorAll(sel).forEach((el) => {
            $(el).css("text-align", "center");
        });
    }
    let fixWidthSelectors = [
        ".property-list .item .value.editable-field"
    ];
    // Disabling as most of the time it will make the custom field being
    // to far from the english field name which looks broken 
    // for (let sel of alignedSelectors){
    //     doc.querySelectorAll(sel).forEach((el) => setWidth(el));
    // }
    // Any editing event on input (removing click & propertychange)
    // $(document).on("propertychange change click keyup input paste","input",function(){
    $(docBody).on("change keyup input paste", "input", function () {
        // console.log("Editing event on input elem");
        setInputRtl(this);
    });
    $("input").each(function () {
        setInputRtl(this);
    })
    rtlIframe(docBody);
    setProseMirrorDirection();
};
// console.log("Loaded rtl");

class Rtl {
    startRtlWatching() {
        let watcher = new RtlWatcher();
        watcher.observe(document.body, rtlPage);
        rtlIframe(document.body);
    }
}

module.exports = Rtl;

