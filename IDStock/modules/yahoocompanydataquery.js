/**
 * yahoocompanydataquery - Query company from 
 * http://finance.yahoo.com/d/quotes.csv?s=XOM+BBDb.TO+JNJ+MSFT&f=snd1l1yr
 * Author John Liu
 * 07/23/2016
 */

var request = require('request');
var csv_stream = require('csv-stream');
var logger = require('../modules/logger')(module);
var async = require('async');

/*
 * Input: symbolObjectArray which has stock symbol in symbolObjectArray[i].symbol
 * Output and callback:
 * callback will take the symbolObjectArray as input  
 * symbolResultArray[i].symbol as stock symbol, 
 * symbolResultArray[i].price as stock price
 */
var symbolResultArray = [];
function query(symbolObjectArray, callback){
	
	// All of these arguments are optional.
	var csvReadOptions = {
	    delimiter: ',', // default is ,
	    endLine: '\n', // default is \n,
	    columns: ['symbol', 'last_tradingday' ,'price', 'dividend', 'pe', 'eps'], // by default read the first line and use values found as columns
	    //escapeChar : '"', // default is an empty string
	    enclosedChar: '"' // default is an empty string
	};
	
	
	var urls = [];
	
	for(var i=0;i<Math.floor(symbolObjectArray.length/200)+1;i++){
		var url = 'http://finance.yahoo.com/d/quotes.csv?s=';
		var remainElement = i===Math.floor(symbolObjectArray.length/200) ? (symbolObjectArray.length%200):200;
		for (var j=200*i;j<200*i+remainElement;j++){
			url = url + symbolObjectArray[j].symbol +'+';
		}
		url=url+'&f=sd1l1yre';
		urls.push(url);
	}
	
	logger.log('info',urls);
	
	async.eachSeries(urls,function(eachUrl,cbEachURL){
		var csvStream = csv_stream.createStream(csvReadOptions);
		request(eachUrl).pipe(csvStream)
        .on('error', function (err) {
        	logger.log('error',err);
        })
        .on('data', function (data) {
        	symbolResultArray.push(data);
        })
        .on('end', function () {
            logger.log('info',eachUrl);
            cbEachURL();
        });
		
	},
	function (err) {
		logger.log('info','yahoopricequery callback triggered');
		callback(symbolResultArray);
	});
}

module.exports = query;

