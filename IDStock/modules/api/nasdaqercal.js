/**
 * nasqaqercal - Query earning report calendar from www.nasdaq.com 
 * Author John Liu
 * 04/27/2016
 */
var request = require('request');
var cheerio = require('cheerio');
var logger = require('../../modules/logging/logger')(module);


/*
 * Input: symbol which is a stock symbol
 * Output and callback:
 * callback will take the erResult as input  
 * erResult.forecast.symbolName as stock symbol, 
 * erResult.forecast.erDate as earning report date, 
 * erResult.forecast.erDetails as earning report details
 * erResult.history[i].fQuarter - Fiscal Quarter End 
 * erResult.history[i].rDate - Date Reported
 * erResult.history[i].eps - EPS
 * erResult.history[i].epsf - EPS forcast
 * erResult.history[i].surprise - EPS surprise
 */

function query(symbol, callback){
	var url = 'http://www.nasdaq.com/earnings/report/'+ symbol;
	logger.log('info',url);
	request.get(url, {timeout: 60000},
            function (error, response, body) {
				var currentSymbol = {symbolName:symbol,erDate:'0000-00-00',erDetails:'Not Provided'};
				var ercalHistoryArray = [];
				var erResult = {forecast:currentSymbol,history:ercalHistoryArray};
                if (!error && response.statusCode === 200) {
                	logger.log('info','requesting' + url + ' finished');
                	//logger.log('info',body);
                	var $ = cheerio.load(body);
                	var dateText = $('h2').eq(0).text();
                	var indexOfColon = dateText.indexOf(':');
                	var dateString = dateText.substr(indexOfColon+2, 12);
                	var d = new Date(dateString);
                	var shortString = 'Invalid Date';
                	try{
                		shortString = d.toISOString();
                	}
                	catch(exception){
                		logger.log('error',exception);
                		shortString = 'Invalid Date';
                	}
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
                    
                    $('tr','#showdata-div').each(function(i, elem) {
                		if(i!=0){
                			var values = $(this).text().trim().split('\r\n\t\t');
                			var ercalHistory ={ }; 
                			ercalHistory.fQuarter = values[0].trim();
                			ercalHistory.rDate = new Date(values[1].trim())..toISOString();
                			ercalHistory.eps = values[2].trim();
                			ercalHistory.epsf = values[3].trim();
                			ercalHistory.surprise = values[4].trim();
                			ercalHistoryArray.push(ercalHistory);
                		}
                	});
                }
                else{
                	if(typeof response!=='undefined'){
                		logger.log('info','Response Code: '+response.statusCode);
                	}
                	else {
                		logger.log('error',error);
                	}
                }
                callback(erResult);
                
            });
}

module.exports = query;