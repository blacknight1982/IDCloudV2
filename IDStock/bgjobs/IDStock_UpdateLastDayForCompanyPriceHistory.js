/**
 * Created by John Liu on 19/05/2017.
 */
var request = require('request');
var async = require("async");
var yahoocompanydataquery = require('../modules/api/yahoocompanydataquery');
var db = require('../modules/persistence/db');
var logger = require('../modules/logging/logger')(module);
	
var IDStock_UpdateLastDayForCompanyPriceHistory = function(){
	
	async.series({
		/*
		 * Step 1 read all company symbols from DB company_basic
		 */
	    step1: function(cbGlobal){

	    	var queryString = 'SELECT distinct symbol FROM company_ercal_history';
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
	    	queryStockLastPriceIntoDB(cbGlobal);
	    }
	},function (err, results) {
	    logger.log('info','cb level2 all executed');
	});
};

function queryStockLastPriceIntoDB(cbGlobal){
	logger.log("info","Entering queryStockLastPriceIntoDB...");
	logger.log('info',symbolArray);
	yahoocompanydataquery(symbolArray,function(symbolObjectArray){
		async.eachSeries(symbolObjectArray,
			function (currentSymbol, cbEachSymbol){
				if(currentSymbol.last_tradingday != 'N/A')
				{
					var dateToInsert = new Date(currentSymbol.last_tradingday);
					var dateToInsertString = dateToInsert.toISOString().slice(0,10);
					var dateToday = new Date();
					var dateTodayString = dateToday.toISOString().slice(0,10);
					//var dividend = currentSymbol.dividend === 'N/A'? 0: currentSymbol.dividend;
					//var pe = currentSymbol.pe === 'N/A'? 0: currentSymbol.pe;
					//var eps = currentSymbol.eps === 'N/A'? 0: currentSymbol.eps;
					var queryString = "INSERT into company_price_history (symbol, price, date, volume) values ('"
						+ currentSymbol.symbol + "'," + currentSymbol.price 
						+ ",'" + dateToInsertString 
						+ "',"+currentSymbol.volume+")"
						+ " ON DUPLICATE KEY UPDATE price = "+ currentSymbol.price+ ", date = '"+dateToInsertString+"'";
					logger.log('info',queryString);
					
					db.get().query(queryString, function (error, results) {
	    	            if (error) {
	    	                logger.log('error',error);
	    	            }
	    	            cbEachSymbol();
	    	        });
				}
				else{
					cbEachSymbol();
				}
			},
			
			function (err){
				cbGlobal();
			});
	});
}

module.exports = IDStock_UpdateLastDayForCompanyPriceHistory;