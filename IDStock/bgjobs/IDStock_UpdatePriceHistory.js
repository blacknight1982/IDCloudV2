/**
 * Created by John Liu on 05/04/2016.
 */
var mysql = require('mysql');
	var async = require("async");
	var yahoopricequeryhistory = require('../modules/yahoopricequeryhistory');
	var quandlpricequeryhistory = require('../modules/quandlpricequeryhistory');
	var logger = require('../modules/logger')(module);
	
var priceSourceArray=[];

var mySQLPool;
	
var IDStock_UpdatePriceHistory = function(){
	
	mySQLPool = mysql.createPool({
	    host: 'localhost',
	    user: 'root',
	    password: 'ljh123',
	    database: 'idstock'
	});
	
	async.series({
		/*
		 * Step 1 - read all tickers from DB price_source
		 */
	    step1: function(cbGlobal){
	        mySQLPool.getConnection(function (err, conn) {
	            if (err) {
	            	throw err;
	            }
	            var queryString = 'SELECT * FROM price_source';
	            conn.query(queryString, function (error, rows, results) {
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
	            conn.release();
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
	    mySQLPool.end();
			
	});

}

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
				mySQLPool.getConnection(function (err, conn) {
				        if (err){
				        	throw err;
				        }
				        conn.query(queryString, function (error, results) {
				            if (error) {
				                logger.log('error',error);
				            }
				            cbEachPriceSource();
				        });
				        conn.release();
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
				mySQLPool.getConnection(function (err, conn) {
				        if (err){
				        	throw err;
				        }
				        conn.query(queryString, function (error, results) {
				            if (error) {
				                logger.log('error',error);
				            }
				            cbEachPriceSource();
				        });
				        conn.release();
				    });
				
			});
		}
		
	},
	function (err){
		cbGlobal();
	});
}

module.exports = IDStock_UpdatePriceHistory;