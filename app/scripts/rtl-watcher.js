
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
	    characterData: true
	    // subtree: true
	};
	function _callback(mutations){
	    callback.call(null,observed,mutations);
	}
	let observer = new MutationObserver(_callback);
	observer.observe(observed, config);
    }
    disconnect(observed){
	if(!this.observers.has(observed)) return;
	this.observers.get(observed).disconnect();
    }
}

module.exports = new RtlWatcher();
