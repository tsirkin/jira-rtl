
class RtlWatcher {
    constructor(){
	this.observers = new WeakMap();
    }
    observe(observed,callback) {
	if(this.observers.has(observed)) return;
	callback.call(null,observed,[]);
	let config = {
	    attributes: true,
	    childList: true,
	    characterData: true,
	    subtree: true
	};
	function _callback(mutations){
	    console.log("inner callback called");
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
