/**
 * 
 * @param {string} ruleId - style element id to create
 * @param {[{selector:string,styles:[[styleName, styleValue, isImportsnt],[...]]}]} rules 
 * @returns 
 */
function addStylesheetRules(styleElemId, rules) {
    if (!styleElemId) {
        return;
    }
    let styleEl;
    if (!document.getElementById(styleElemId)) {
        // the rules already exists
        styleEl = document.createElement('style');
        styleEl.id = styleElemId;
        // Append <style> element to <head>
        document.head.appendChild(styleEl);
    } else {
        styleEl = document.getElementById(styleElemId);
    }

    // Grab style element's sheet
    var styleSheet = styleEl.sheet;
    //debugger
    for (var i = 0; i < rules.length; i++) {
        var rule = rules[i],
            propStr = '';
        let { selector, styles } = rule
        if (!Array.isArray(styles)) {
            console.log("Style with selector %o should be an array, given %o", selector, styles)
            continue;
        }
        styles.forEach(style => {
            let [styleName, styleValue, isImportant] = style;
            propStr += styleName + ': ' + styleValue + (isImportant ? ' !important' : '') + ';\n';
        })

        // Insert CSS Rule
        styleSheet.insertRule(selector + '{' + propStr + '}', styleSheet.cssRules.length);
    }
}

function removeRule(styleElemId, ruleSelector) {
    if (!styleElemId || !document.getElementById(styleElemId)) {
        // the rules already exists
        return;
    }
    let styleEl = document.getElementById(styleElemId)
    var styleSheet = styleEl.sheet;
    if (styleSheet.cssRules) {
        for (var i = 0; i < styleSheet.cssRules.length; i++) {
            if (styleSheet.cssRules[i].selectorText === ruleSelector) {
                styleSheet.deleteRule(i);
            }
        }
    }
}

function ruleExists(styleElemId, ruleSelector) {
    if (!document.getElementById(styleElemId)) {
        // the rules already exists
        return false;
    }
    let styleEl = document.getElementById(styleElemId)
    var styleSheet = styleEl.sheet;
    if (styleSheet.cssRules) {
        for (var i = 0; i < styleSheet.cssRules.length; i++) {
            if (styleSheet.cssRules[i].selectorText === ruleSelector) {
                return true;
            }
        }
    }
    return false;
}

function addRuleIfNotExists(styleElemId, rule) {
    //debugger
    if (ruleExists(styleElemId, rule.selector)) {
        return;
    }
    addStylesheetRules(styleElemId, [rule])
}

module.exports = { addStylesheetRules, removeRule, addRuleIfNotExists }