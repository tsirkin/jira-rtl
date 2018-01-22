global.ccWatcherCalls = 0;
class RtlWatcher {
    constructor(){
	this.observers = new WeakMap();
    }
    observe(observed,callback) {
	if(this.observers.has(observed)) return;
	callback.call(null,observed,[]);
	let config = {
            // At the mean time disabling attribute watching as it is
            // unlikely to be usefull and on the bad side it causes
            // infinite event loop when changing css
	    // attributes: true,
	    childList: true,
	    characterData: true,
	    subtree: true
	};
	function _callback(mutations){
	    console.log("inner callback called");
            global.ccWatcherCalls++;
            if(global.ccWatcherCalls > 1000){
                //Avoid endless event loop hack
                console.log("mutations %o",mutations);
                return;
            }
            mutations.forEach(function(mutation){
                if(mutation.addedNodes){
                    mutation.addedNodes.forEach(function(node){
                        if(node.tagName == "BDI"){
                            return;
                        }
                    });
                }
            });
	    callback.call(null,observed,mutations);
	}
	console.log("creating observer");
	let observer = new MutationObserver(_callback);
	console.log("observer created");
	observer.observe(observed, config);
	this.observers.set(observed,observer);
    }
    disconnect(observed){
	if(!this.observers.has(observed)) return;
	this.observers.get(observed).disconnect();
    }
}

module.exports = RtlWatcher;
