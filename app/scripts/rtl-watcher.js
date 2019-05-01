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

// global.ccWatcherCalls = 0;
var $ = require("jquery");
class RtlWatcher {
    constructor() {
        this.observers = new WeakMap();
    }
    observe(observed, callback, noFirstRun) {
        console.log("starting observing");
        this.stopped = 0;
        if(!noFirstRun){
            callback.call(null, observed, []);
        }
        let config = {
            // At the mean time disabling attribute watching as it is
            // unlikely to be usefull and on the bad side it causes
            // infinite event loop when changing css
            // attributes: true,
            childList: true,
            characterData: true,
            subtree: true
        };
        function _callback(mutations) {
            console.log("observer callback called");
            if(this.stopped){
                console.log("returning because the observer is stopped");
                return;
            }
            // This of cause is not a solution, it maybe workable to
            // check the interval between callback.
            // global.ccWatcherCalls++;
            // if(global.ccWatcherCalls > 1000){
            //     //Avoid endless event loop hack
            //     console.log("mutations %o",mutations);
            //     return;
            // }
            function hasJirartlAttribute(node) {
                var attrs = node.attributes;
                for (var i = 0; i < attrs.length; i++) {
                    if(attrs[i].name == "data-jirartl"){
                        return true;
                    }
                }
                return false;
            }
            function isRtlNode(node) {
                // if(node.getAttribute){
                //     console.log("node %o attribute %o",node,$(node).attr("data-jirartl"));
                // }
                if (node.tagName == "BDI" ||
                    (node.attributes && hasJirartlAttribute(node))) {
                    console.log("check is rtl node %o attributes %o", node, node.attributes);
                    return true;
                }
                if (!node.attributes) {
                    console.log("check not rtl node without getAttribute method");
                } else {
                    console.log("check not rtl node %o attributes %o dataset %o", node, node.attributes,node.dataset);
                }
                return false;
            }
            console.log("*********** Start *******************")
            let hasAddedNodes = false;
            console.log("mutations %o", mutations);
            mutations.forEach(function (mutation) {
                if (mutation.type == 'attributes') {
                    if (mutation.attributeName == "data-jirartl") {
                        return;
                    }
                }
                if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(function (node) {
                        if (isRtlNode(node) || hasAddedNodes || (node.parentNode && isRtlNode(node.parentNode))) {
                            return;
                        }
                        console.log("non rtl node %o name %o type %o parent %o parent name %o parent type %o",
                            node,
                            node.tagName,
                            node.nodeType,
                            node.parentNode,
                            node.parentNode.tagName,
                            node.parentNode.nodeType);
                        hasAddedNodes = true;
                        return;
                    });
                }
            });
            if (hasAddedNodes) {
                callback.call(null, observed, mutations);
            }
            console.log("*********** End *******************")
        }
        let observer = this.observers.get(observed);
        if(!observer){
            console.log("creating observer");
            observer = new MutationObserver(_callback);
        }
        observer.observe(observed, config);
        this.observers.set(observed, observer);
    }
    disconnect(observed) {
        if (!this.observers.has(observed)) {
            console.log("couldn't find observer ");
            return;
        };
        console.log("stopping observer ");
        this.observers.get(observed).disconnect();
        this.stopped = 1;
    }
}

module.exports = RtlWatcher;
