
class BaseChromeStorage{
    constructor(area = 'local'){
	if (['local', 'sync'].indexOf(area) < 0) {
	    throw new Error(`Area ${area} is not supported.`);
	}
	this.area = chrome.storage[area];
    }
    get(key){
	return new Promise((resolve) => {
	    this.area.get(key,function(values){
		resolve(values[key]);
	    });
	});
    }
    set(key,value){
	return new Promise((resolve) => {
	    let obj = {};
	    obj[key] = value;
	    this.area.set(obj,function() {
		resolve();
	    });
	});
    }
    merge(key,obj){
	this.get(key).then(function(oldObj){
	    let newObj = Object.assign({},oldObj,obj);
	    return new Promise((resolve) => {
		let storeObj = {};
		storeObj[key] = newObj;
		this.area.set(storeObj,function() {
		    resolve();
		});
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
