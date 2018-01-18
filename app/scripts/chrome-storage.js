
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
		area.set(storeObj,function() {
		    resolve();
		});
	    });
	});
    }
    removeNested(key,nestedKey){
	this.get(key).then(function(oldObj){
	    delete oldObj[nestedKey];
	    return this.set(key,oldObj);
	})
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
