/**
 * quandlpricequeryhistoryforcompany - Query stock history price from 
 * https://www.quandl.com/api/v3/datasets/WIKI/<symbol>.csv
 * Author John Liu
 * 07/27/2016
 */

var request = require('request');
var logger = require('../../modules/logging/logger')(module);
var async = require('async');
var csv_stream = require('csv-stream');

var csvReadOptionsTicker = {
		delimiter: ',', // default is ,
	    endLine: '\n', // default is \n,
	    //columns: ['date', 'Adj. Open', 'Adj. High', 'Adj. Low', 'Adj. Close', 'Adj. Volume']
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
	
	var url = 'https://www.quandl.com/api/v3/datasets/XNAS/'+ symbol + '.csv?start_date='+start_date+'&end_date='+end_date+'&api_key=y4dzZ4d6MzPVFdwmrycx';
	var historyPriceArray=[];
	logger.log('info',url);
	var csvStreamTicker = csv_stream.createStream(csvReadOptionsTicker);
	request(url).pipe(csvStreamTicker)
		.on('data', function (oneDayData) {
			var historyPrice = {
						date:oneDayData.Date,
						open:oneDayData['Adj. Open'],
						high:oneDayData['Adj. High'],
						low:oneDayData['Adj. Low'],
						adjClose:oneDayData['Adj. Close'],
						volume:oneDayData['Adj. Volume']
					};
			historyPriceArray.push(historyPrice);
        })
        .on('end', function () {  
        	//historyPriceArray.shift();
        	callback(historyPriceArray);
        })
        .on('error', function (error) {
        	logger.log('error',error);
        	callback(historyPriceArray);
        });
}

module.exports = queryHistory;

