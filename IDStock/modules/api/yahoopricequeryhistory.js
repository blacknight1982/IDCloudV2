/**
 * yahoopricequeryhistory - Query stock history price from 
 * http://ichart.finance.yahoo.com/table.csv?s=<symbol>
 * Author John Liu
 * 04/30/2016
 */

var request = require('request');
var logger = require('../../modules/logging/logger')(module);
var async = require('async');
var csv_stream = require('csv-stream');

var csvReadOptionsTicker = {
		delimiter: ',', // default is ,
	    endLine: '\n', // default is \n,
	    columns: ['date', 'open', 'high', 'low', 'close', 'volume', 'adjClose']
}

/*
 * Input: symbol which is stock symbol
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

function queryHistory(symbol, callback){
	var url = 'http://ichart.finance.yahoo.com/table.csv?s='+ symbol;
	var historyPriceArray=[];
	logger.log('info',url);
	var csvStreamTicker = csv_stream.createStream(csvReadOptionsTicker);
	request(url).pipe(csvStreamTicker)
		.on('data', function (oneDayData) {
			var historyPrice = {
					date:oneDayData.date,
					open:oneDayData.open,
					high:oneDayData.high,
					low:oneDayData.low,
					close:oneDayData.close,
					settle:oneDayData.close,
					volume:oneDayData.volume,
					adjClose:oneDayData.adjClose
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

