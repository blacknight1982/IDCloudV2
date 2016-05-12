/**
 * nasqaqercal - Query earning report calendar from www.nasdaq.com 
 * Author John Liu
 * 04/27/2016
 */
var request = require('request');
var cheerio = require('cheerio');
var logger = require('../modules/logger')(module);


/*
 * Input: symbol which is a stock symbol
 * Output and callback:
 * callback will take the symbolobject as input  
 * symbolobject.symbolName as stock symbol, 
 * symbolobject.erDate as earning report date, 
 * symbolobject.erDetails as earning report details
 */

function query(symbol, callback){
	var url = 'http://www.nasdaq.com/earnings/report/'+ symbol;
	logger.log('info',url);
	request.get(url, {timeout: 60000},
            function (error, response, body) {
				var currentSymbol = {symbolName:symbol,erDate:'0000-00-00',erDetails:'Not Provided'};
                if (!error && response.statusCode === 200) {
                	logger.log('info','requesting' + url + ' finished');
                	//logger.log('info',body);
                	var $ = cheerio.load(body);
                	var dateText = $('h2').eq(0).text();
                	var indexOfColon = dateText.indexOf(':');
                	var dateString = dateText.substr(indexOfColon+2, 12);
                	var d = new Date(dateString);
                    var shortString = d.toLocaleDateString(); 
                    currentSymbol.erDate = shortString; 
                    if(shortString === 'Invalid Date'){
                    	currentSymbol.erDate = '0000-00-00';
                    }
                    
                    var timeText = $('#two_column_main_content_reportdata').text();
                    if(timeText.indexOf("hasn't provided us")>-1){
                    	currentSymbol.erDetails = 'Not Provided';
                    }                        
                    else {
                    	var indexOfERtime = timeText.indexOf(" on ");
                    	var tempString = timeText.substr(indexOfERtime+5,30);
                    	var indexOfPeriod = tempString.indexOf(".");
                    	currentSymbol.erDetails = tempString.substr(0,indexOfPeriod);
                    }
                    callback(currentSymbol);
                }
                else{
                	callback(currentSymbol);
                	if(typeof response!=='undefined'){
                		logger.log('info','Response Code: '+response.statusCode);
                	}
                	else {
                		logger.log('error',error);
                	}
                }
                
            });
}

module.exports = query;