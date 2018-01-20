
class BaseChromeStorage{
    constructor(area = 'local'){
	if (['local', 'sync'].indexOf(area) < 0) {
	    throw new Error(`Area ${area} is not supported.`);
	}
	this.area = chrome.storage[area];
    }
    get(key){
	var area = this.area;
	return new Promise((resolve) => {
	    area.get(key,function(values){
		resolve(values[key]);
	    });
	});
    }
    set(key,value){
	var area = this.area;
	return new Promise((resolve) => {
	    let obj = {};
	    obj[key] = value;
	    area.set(obj,function() {
		resolve();
	    });
	});
    }
    merge(key,obj){
	var area = this.area;
	this.get(key).then(function(oldObj){
	    let newObj = Object.assign({},oldObj,obj);
	    return new Promise((resolve) => {
		let storeObj = {};
		storeObj[key] = newObj;
		console.log("Storing object %o",storeObj);
		area.set(storeObj,function() {
		    resolve();
		});
	    });
	});
    }
    removeNested(key,nestedKey){
	var area = this.area;
	var removeCallback = function(oldObj){
	    console.log("Old object %o ",oldObj);
	    if(!(nestedKey in oldObj)) return;
	    delete oldObj[nestedKey];
	    console.log("Calling set ");
	    this.set(key,oldObj);
	}.bind(this);
	this.get(key).then(removeCallback);
    }
    remove(key,obj){
	var area = this.area;
	return new Promise((resolve,reject) => {
	    area.remove(key,function(values){
		if(runtime.lastError && reject)
		    reject(runtime.lastError);
		resolve();
	    });
	});
    }
}

class ChromeSyncStorage extends BaseChromeStorage{
    constructor(){
	super('sync');
    }
}

class ChromeLocalStorage extends BaseChromeStorage{
    constructor(){
	super('local');
    }
}

module.exports = {
    ChromeSyncStorage : ChromeSyncStorage,
    ChromeLocalStorage : ChromeLocalStorage,
    BaseChromeStorage : BaseChromeStorage
};
