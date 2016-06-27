/**
 * Created by John Liu on 04/28/2016.
 */
var request = require('request');
var async = require("async");
var yahoopricequery = require('../modules/yahoopricequery');
var db = require('../modules/db.js');
var logger = require('../modules/logger')(module);

var symbolArray = [];

var IDStock_UpdateStockPrice = function(){
	
	async.series({
		/*
		 * Step 1 read all company symbols from DB company_tickers
		 */
	    step1: function(cbGlobal){

	    	var queryString = 'SELECT symbol FROM ticker_price';
	    	db.get().query(queryString, function (error, rows, results) {
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
};

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
				
				db.get().query(queryString, function (error, results) {
    	            if (error) {
    	                logger.log('error',error);
    	            }
    	            cbEachSymbol();
    	        });
				
			},
			
			function (err){
				cbGlobal();
			});
	});
}

module.exports = IDStock_UpdateStockPrice;