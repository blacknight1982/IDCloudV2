/**
 * yahoopricequery - Query stock price from 
 * http://finance.yahoo.com/webservice/v1/symbols/<company.symbol>/quote?format=json
 * Author John Liu
 * 04/28/2016
 */

var request = require('request');
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
	
	
	var urls = [];
	
	for(var i=0;i<Math.floor(symbolObjectArray.length/200)+1;i++){
		var url = 'http://finance.yahoo.com/webservice/v1/symbols/';
		var remainElement = i===Math.floor(symbolObjectArray.length/200) ? (symbolObjectArray.length%200):200;
		for (var j=200*i;j<200*i+remainElement;j++){
			url = url + symbolObjectArray[j].symbol +',';
		}
		url=url+'/quote?format=json';
		urls.push(url);
	}
	
	logger.log('info',urls);
	
	async.eachSeries(urls,function(eachUrl,cbEachURL){
		request.get(eachUrl, {timeout: 10000},
	            function (error, response, body) {
					if (!error && response.statusCode === 200) {
						try{
							var jsonResult = JSON.parse(body);
							if (jsonResult.list.meta.count!= 0){
								
								for (var i=0;i<jsonResult.list.meta.count;i++){
									var result = {symbol:'',price:0};
									result.price = jsonResult.list.resources[i].resource.fields.price;
									result.symbol = jsonResult.list.resources[i].resource.fields.symbol;
									symbolResultArray.push(result);
								} 
							}
							cbEachURL();
						}
						catch(err){
							logger.log('error',err);
							cbEachURL();
						}
					}
					else{
			        	logger.log('error',error);
			        	cbEachURL();
			        }
		});
	},
	function (err) {
		logger.log('info','yahoopricequery callback triggered');
		logger.log('info',symbolResultArray);
		callback(symbolResultArray);
	});
}

module.exports = query;

