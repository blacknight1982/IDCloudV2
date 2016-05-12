/**
 * quandlpricequeryhistory - Query stock history price from 
 * https://www.quandl.com/api/v3/datasets/CHRIS/<symbol>.json
 * Author John Liu
 * 05/03/2016
 */

var request = require('request');
var logger = require('../modules/logger')(module);
var async = require('async');
var csv_stream = require('csv-stream');

/*
 * Input: symbol which is stock symbol
 * Input: start date in format of yyyy-mm-dd
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
	var csvColumns = [];
	if(symbol === 'CBOE_VX1'){
		csvColumns = ['date', 'open', 'high', 'low', 'close','settle','change','volume'];
	}
	else if((symbol === 'CME_CL1')||(symbol === 'CME_NG1')){
		csvColumns = ['date', 'open', 'high', 'low', 'close','change','settle','volume'];
	}
	
	var csvReadOptionsTicker = {
			delimiter: ',', // default is ,
		    endLine: '\n', // default is \n,
		    columns: csvColumns
	}
	var url = 'https://www.quandl.com/api/v3/datasets/CHRIS/'+ symbol + '.csv';
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
						settle:oneDayData.settle,
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

