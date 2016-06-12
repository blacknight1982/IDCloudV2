/**
 * New node file
 */
var yahoopricequery = require('./yahoopricequery');
var yahoopricequeryhistory = require('./yahoopricequeryhistory');
var quandlpricequeryhistory = require('./quandlpricequeryhistory');
var nasdaqercalhistory = require('./nasdaqercalhistory');
var async = require('async');
var decaycalc = require('./decaycalc');
var logger = require('./logger')(module);

var symbolArray=[{symbol:'AAPL'},{symbol:'GOOG'},{symbol:'NUGT'},{symbol:'GDX'},{symbol:'NRZ'},{symbol:'UWTI'}];
var historyPriceArrayTarget = [];
var historyPriceArraySubject = [];


//yahoopricequery(symbolArray,callback);

nasdaqercalhistory('AAPL',callback);

function callback(array1){
	console.log(array1);
}


/*async.series({
	step3:function(cbsteps){
		decaycalc('UVXY','CBOE_VX1','2015-01-21','2016-04-29',2,callback);
		cbsteps();
	}
		
},
	function (err, results) {
    logger.log('info','cb level2 all executed');
});*/
