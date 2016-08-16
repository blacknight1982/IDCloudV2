/**
 * New node file
 */
var yahoocompanydataquery = require('./yahoocompanydataquery');
var quandlpricequeryhistoryforcompany = require('./quandlpricequeryhistoryforcompany');
var yahoopricequeryhistoryforcompany = require('./yahoopricequeryhistoryforcompany');
var nasdaqercal = require('./nasdaqercal');
var IDStock_UpdateCustomCompany = require('./IDStock_UpdateCustomCompany');
var yqlcompanydataquery = require('./yqlcompanydataquery');
var async = require('async');
var decaycalc = require('./decaycalc');
var logger = require('./logger')(module);
var db = require('./db');

var symbolArray=[{symbol:'AAPL'},{symbol:'GOOG'},{symbol:'NUGT'},{symbol:'GDX'},{symbol:'NRZ'},{symbol:'UWTI'}];
var symbolArray2=[{symbol:'1234'}];
var historyPriceArrayTarget = [];
var historyPriceArraySubject = [];


//yahoopricequery(symbolArray,callback);

//yahoopricequeryhistoryforcompany('AAPL','2010-06-25','2016-07-27',callback)
//nasdaqercalhistory('AAPL',callback);

//yahoocompanydataquery(symbolArray,callback);
//nasdaqercal('AAPL',callback);

db.connect(db.MODE_PRODUCTION, function(err) {
	  if (err) {
	    console.log('Unable to connect to MySQL.');
	    process.exit(1);
	  } else {
		  //IDStock_UpdateCompanyData();
		  //IDStock_UpdateCompanyPriceHistory();
		  //IDStock_UpdatePriceHistory();
		  //IDStock_UpdateERCalendar();
		  IDStock_UpdateCustomCompany('AAPL',callback);
	  }
});

//yqlcompanydataquery(symbolArray2,callback);


function callback(array1){
	start_date = new Date('2016-07-01');
	end_date = new Date('2016-09-05');
	start_date.setDate(start_date.getDate() - 7);
	end_date.setDate(end_date.getDate() + 7);
	start_date = start_date.toLocaleString().slice(0,10);
	end_date = end_date.toLocaleString().slice(0,10);
	console.log(array1);
	console.log(start_date);
	console.log(end_date);
	console.log(parseInt(start_date.substring(8,10)));
	console.log(parseInt(start_date.substring(0,4)));
	console.log(parseInt(start_date.substring(5,7)));
}


