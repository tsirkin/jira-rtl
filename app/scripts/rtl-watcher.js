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
class RtlWatcher {
    constructor() {
        this.observers = new WeakMap();
    }
    observe(observed, callback) {
        if (this.observers.has(observed)) return;
        callback.call(null, observed, []);
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
            console.log("inner callback called");
            // This of cause is not a solution, it maybe workable to
            // check the interval between callback.
            // global.ccWatcherCalls++;
            // if(global.ccWatcherCalls > 1000){
            //     //Avoid endless event loop hack
            //     console.log("mutations %o",mutations);
            //     return;
            // }
            mutations.forEach(function (mutation) {
                if (mutation.addedNodes) {
                    mutation.addedNodes.forEach(function (node) {
                        if (node.tagName == "BDI") {
                            return;
                        }
                    });
                }
            });
            console.log("calling on mutations %o", mutations)
            //debugger
            callback.call(null, observed, mutations);
        }
        console.log("creating observer");
        let observer = new MutationObserver(_callback);
        console.log("observer created");
        observer.observe(observed, config);
        this.observers.set(observed, observer);
    }
    disconnect(observed) {
        if (!this.observers.has(observed)) return;
        this.observers.get(observed).disconnect();
    }
}

module.exports = RtlWatcher;
