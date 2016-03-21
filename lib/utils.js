var utils = module.exports;

/**
 * Check and invoke callback function
 */
utils.invokeCallback = function(cb) {
	if(!!cb && typeof cb === 'function') {
		cb.apply(null, Array.prototype.slice.call(arguments, 1));
	}
};

/**
 * clone an object
 */
utils.clone = function(origin) {
	if(!origin) {
		return;
	}

	var obj = {};
	for(var f in origin) {
		if(origin.hasOwnProperty(f)) {
			obj[f] = origin[f];
		}
	}
	return obj;
};

utils.size = function(obj) {
	if(!obj) {
		return 0;
	}

	var size = 0;
	for(var f in obj) {
		if(obj.hasOwnProperty(f)) {
			size++;
		}
	}

	return size;
};

utils.getNowTimeStamp = function() {
    var date = new Date();
    var now = date.getUTCFullYear() + '-' + ('00' + (date.getUTCMonth()+1)).slice(-2) + '-' + date.getUTCDate() + ' ' + ('00' + date.getUTCHours()).slice(-2) + ':' + ('00' + date.getUTCMinutes()).slice(-2) + ':' + ('00' + date.getUTCSeconds()).slice(-2);
    return now;
};

utils.convertBooleanToInt = function(b) {
    if( b === true ) {
        return 1;
    }

    return 0;
};

utils.cashStringFormat = function( raw_cash ) {
    var cash = parseInt(raw_cash);
    if( raw_cash < 1000 ) {
        return "" + raw_cash;
    }

    var k = 0;
    var t = [];
    while ( cash > 0 ) {
        k = cash % 1000;
        cash = Math.floor( cash / 1000 );
        t.push(k);
    }


    var res = "";
    for( var i = 0; i < t.length; ++i ) {
        k = t [ i ] ;

        if( i == t.length - 1 ) {
            res = "" + k + res;
        } else {

            if( k == 0 ) {
                res = ",000" + res;
            } else if( k < 10 ) {
                res = ",00" + k + res;
            } else if( k < 100 ) {
                res = ",0" + k + res;
            } else {
                res = "," + k + res;
            }
        }

    }

   // console.error("cashStringFormat "  + raw_cash + " "+ JSON.stringify(t) + " "+ res);

    return res;
};

utils.filterInt = function (value) {
    if(/^\-?([0-9]+|Infinity)$/.test(value))
        return Number(value);
    return NaN;
};

utils.validString = function (str) {
    if( str == null ) {
        return false;
    }

    if( str.length === 0 ) {
        return false;
    }

    return true;
};


