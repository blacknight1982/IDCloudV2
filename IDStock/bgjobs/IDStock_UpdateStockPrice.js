/**
 * Created by John Liu on 04/28/2016.
 */
var request = require('request');
var mysql = require('mysql');
var async = require("async");
var yahoopricequery = require('../modules/yahoopricequery');
var logger = require('../modules/logger')(module);

var symbolArray = [];

var mySQLPool;

var IDStock_UpdateStockPrice = function(){
	
	mySQLPool = mysql.createPool({
	    host: 'localhost',
	    user: 'root',
	    password: 'ljh123',
	    database: 'idstock'
	});
	
	async.series({
		/*
		 * Step 1 read all company symbols from DB company_tickers
		 */
	    step1: function(cbGlobal){
	        mySQLPool.getConnection(function (err, conn) {
	            if (err) {
	            	throw err;
	            }
	            var queryString = 'SELECT symbol FROM ticker_price';
	            conn.query(queryString, function (error, rows, results) {
	                if (error) {
	                    logger.log('error',error);
	                    throw error;
	                }
	                else {
	                	symbolArray = rows;
	                	//symbolArray = symbolArray.slice(0,2);
	                	logger.log('info',symbolArray);
	                }
	                cbGlobal();
	            });
	            conn.release();
	        });
	    },
	            
	    /*
	     * Step2: Query for Earning Calendar into symbolArray
	     */
	    step2: function(cbGlobal){
	    	queryStockPriceIntoDB(cbGlobal);
	    }
	},function (err, results) {
	    logger.log('info','cb level2 all executed');
	    mySQLPool.end();
	});
}

function queryStockPriceIntoDB(cbGlobal){
	logger.log("info","Entering queryStockPriceIntoDB...");
	var dateToday = new Date();
	var dateTodayString = dateToday.toLocaleDateString().slice(0,10);
	logger.log('info',symbolArray);
	yahoopricequery(symbolArray,function(symbolObjectArray){
		async.eachSeries(symbolObjectArray,
			function (currentSymbol, cbEachSymbol){
				var queryString = "UPDATE ticker_price SET price = "+ currentSymbol.price+", last_update = '" + dateTodayString+"' where symbol = '"+currentSymbol.symbol+"' and last_update <= '"+dateTodayString+"'";
				logger.log('info',queryString);
				mySQLPool.getConnection(function (err, conn) {
	    	        if (err){
	    	        	throw err;
	    	        }
	    	        conn.query(queryString, function (error, results) {
	    	            if (error) {
	    	                logger.log('error',error);
	    	            }
	    	            cbEachSymbol();
	    	        });
	    	        conn.release();
	    	    });
			},
			
			function (err){
				cbGlobal();
			});
	});
}

module.exports = IDStock_UpdateStockPrice;