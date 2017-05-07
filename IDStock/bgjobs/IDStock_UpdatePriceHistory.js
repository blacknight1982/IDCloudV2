/**
 * Created by John Liu on 05/04/2016.
 */
var async = require("async");
var yahoopricequeryhistory = require('../modules/api/yahoopricequeryhistory');
var quandlpricequeryhistory = require('../modules/api/quandlpricequeryhistory');	
var db = require('../modules/persistence/db');
var logger = require('../modules/logging/logger')(module);
	
var priceSourceArray=[];
	
var IDStock_UpdatePriceHistory = function(){
	
	async.series({
		/*
		 * Step 1 - read all tickers from DB price_source
		 */
	    step1: function(cbGlobal){
	        
	    	var queryString = 'SELECT * FROM price_source';
	    	db.get().query(queryString, function (error, rows, results) {
                if (error) {
                    logger.log('error',error);
                    throw error;
                }
                else {
                	priceSourceArray = rows;
                	//symbolArray = symbolArray.slice(0,2);
                	logger.log('info',priceSourceArray);
                }
                cbGlobal();
            });
	    	
	    },
	
		/*
		 * Step 2 - Query history price from priceSourceArray and update DB
		 */
	    step2: function(cbGlobal){
	    	queryTickerPriceHistoryIntoDB(cbGlobal);
	    }
	},
		function (err, results) {
	    logger.log('info','cb level2 all executed');			
	});

};

function queryTickerPriceHistoryIntoDB(cbGlobal){
	logger.log("info","Entering queryTickerPriceHistoryIntoDB...");
	async.eachSeries(priceSourceArray,function(eachPriceSource,cbEachPriceSource){
		if(eachPriceSource.source === 'QUANDL'){
			quandlpricequeryhistory(eachPriceSource.symbol,function(historyPriceArray){
				var queryString = 'insert into price_history (symbol, date, open, high, low, close, settle, adj_close, volume) values ';
				for(var i=0;i<historyPriceArray.length;i++){
					queryString = queryString + "('" + eachPriceSource.symbol + "','" + historyPriceArray[i].date + "'," +
					historyPriceArray[i].open + "," + historyPriceArray[i].high + "," + historyPriceArray[i].low + "," + historyPriceArray[i].close +
					"," + historyPriceArray[i].settle + "," + historyPriceArray[i].adjClose + "," + historyPriceArray[i].volume + "),";
				}
				queryString = queryString.substr(0, queryString.length - 1);
				queryString = queryString + " ON DUPLICATE KEY UPDATE symbol ='"+eachPriceSource.symbol+"'";
				logger.log('info',queryString);

				db.get().query(queryString, function (error, results) {
		            if (error) {
		                logger.log('error',error);
		            }
		            cbEachPriceSource();
		        });
				
			});
		}
		else if(eachPriceSource.source === 'YAHOO'){
			yahoopricequeryhistory(eachPriceSource.symbol,function(historyPriceArray){
				var queryString = 'insert into price_history (symbol, date, open, high, low, close, settle, adj_close, volume) values ';
				for(var i=0;i<historyPriceArray.length;i++){
					queryString = queryString + "('" + eachPriceSource.symbol + "','" + historyPriceArray[i].date + "'," +
					historyPriceArray[i].open + "," + historyPriceArray[i].high + "," + historyPriceArray[i].low + "," + historyPriceArray[i].close +
					"," + historyPriceArray[i].settle + "," + historyPriceArray[i].adjClose + "," + historyPriceArray[i].volume + "),";
				}
				queryString = queryString.substr(0, queryString.length - 1);
				queryString = queryString + "ON DUPLICATE KEY UPDATE symbol ='"+eachPriceSource.symbol+"'";
				
				db.get().query(queryString, function (error, results) {
		            if (error) {
		                logger.log('error',error);
		            }
		            cbEachPriceSource();
		        });
				
			});
		}
		
	},
	function (err){
		cbGlobal();
	});
}

module.exports = IDStock_UpdatePriceHistory;