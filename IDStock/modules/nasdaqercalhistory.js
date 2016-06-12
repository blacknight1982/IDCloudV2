/**
 * nasdaqercalhistory - Query earning report calendar history from www.nasdaq.com 
 * Author John Liu
 * 06/06/2016
 */
var request = require('request');
var cheerio = require('cheerio');
var logger = require('../modules/logger')(module);


/*
 * Input: symbol which is a stock symbol
 * Output and callback:
 * callback will take the ercalHistoryArray as input  
 * ercalHistoryArray[i].fQuarter - Fiscal Quarter End 
 * ercalHistoryArray[i].rDate - Date Reported
 * ercalHistoryArray[i].eps - EPS
 * ercalHistoryArray[i].epsf - EPS forcast
 * ercalHistoryArray[i].surprise - EPS surprise
 */

function query(symbol, callback){
	var url = 'http://www.nasdaq.com/earnings/report/'+ symbol;
	logger.log('info',url);
	request.get(url, {timeout: 60000},
            function (error, response, body) {
				var ercalHistoryArray = [];
                if (!error && response.statusCode === 200) {
                	logger.log('info','requesting ' + url + ' finished');
                	//logger.log('info',body);
                	var $ = cheerio.load(body);
                	//$('.genTable','#showdata-div');
                	//$ = $('.genTable','#showdata-div');
                	//$ = cheerio.load($('.genTable','#showdata-div').html());
                	$('tr','#showdata-div').each(function(i, elem) {
                		if(i!=0){
                			var values = $(this).text().trim().split('\r\n\t\t');
                			var ercalHistory ={ }; 
                			ercalHistory.fQuarter = values[0].trim();
                			ercalHistory.rDate = new Date(values[1].trim()).toLocaleDateString();
                			ercalHistory.eps = values[2].trim();
                			ercalHistory.epsf = values[3].trim();
                			ercalHistory.surprise = values[4].trim();
                			ercalHistoryArray.push(ercalHistory);
                		}
                	});
                }
                	
                    callback(ercalHistoryArray);
                
            });
}

module.exports = query;