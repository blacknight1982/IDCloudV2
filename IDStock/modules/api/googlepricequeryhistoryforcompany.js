/**
 * googlepricequeryhistoryforcompany - Query stock history price from 
 * http://www.google.com/finance/historical?q=<symbol>&startdate=Jan+01%2C+2009&enddate=Aug+2%2C+2017&output=csv
 * Author John Liu
 * 05/19/2017
 */

var request = require('request');
var logger = require('../../modules/logging/logger')(module);
var async = require('async');
var csv_stream = require('csv-stream');

var csvReadOptionsTicker = {
		delimiter: ',', // default is ,
	    endLine: '\n', // default is \n,
	    columns: ['date', 'open', 'high', 'low', 'close', 'volume']
}

/*
 * Input: symbol which is stock symbol
 * Input: start date in format of yyyy-mm-dd
 * Input: end date in format of yyyy-mm-dd
 * Output and callback:
 * callback will take the historyPriceArray as input  
 * historyPrice.date as date, 
 * historyPrice.open as open price,
 * historyPrice.high as high price,
 * historyPrice.low as low price,
 * historyPrice.close as close price,
 * historyPrice.settle as future settle price,
 * historyPrice.volume as volume,
 * historyPrice.adjClose as adjusted close price,
 */

function queryHistory(symbol, start_date, end_date, callback){
	s_month = parseInt(start_date.substring(5,7))-1;
	s_day = parseInt(start_date.substring(8,10));
	s_year = parseInt(start_date.substring(0,4));
	e_month = parseInt(end_date.substring(5,7))-1;
	e_day = parseInt(end_date.substring(8,10));
	e_year = parseInt(end_date.substring(0,4));
	var url = "http://www.google.com/finance/historical?q="+ symbol+"&startdate="+start_date+"&enddate="+end_date+"&output=csv";
	var historyPriceArray=[];
	logger.log('info',url);
	var csvStreamTicker = csv_stream.createStream(csvReadOptionsTicker);
	request(url,{timeout: 60000}).pipe(csvStreamTicker)
		.on('data', function (oneDayData) {
			var historyPrice = {
					date:oneDayData.date,
					open:oneDayData.open,
					high:oneDayData.high,
					low:oneDayData.low,
					close:oneDayData.close,
					settle:oneDayData.close,
					volume:oneDayData.volume,
					adjClose:oneDayData.close
				};
			historyPriceArray.push(historyPrice);
        })
        .on('end', function () {  
        	historyPriceArray.shift();
        	callback(historyPriceArray);
        })
        .on('error', function (error) {
        	logger.log('error',error);
        	callback(historyPriceArray);
        });
}

module.exports = queryHistory;

