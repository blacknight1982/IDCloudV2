/**
 * Created by John Liu on 07/22/2016.
 */
var request = require('request');
var async = require("async");
var yahoocompanydataquery = require('../modules/api/yahoocompanydataquery');
var db = require('../modules/persistence/db');
var logger = require('../modules/logging/logger')(module);

var symbolArray = [];

var IDStock_UpdateCompanyData = function(){
	
	async.series({
		/*
		 * Step 1 read all company symbols from DB company_tickers
		 */
	    step1: function(cbGlobal){

	    	var queryString = 'SELECT symbol FROM company_tickers';
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
	});
};

function queryStockPriceIntoDB(cbGlobal){
	logger.log("info","Entering queryStockPriceIntoDB...");
	logger.log('info',symbolArray);
	yahoocompanydataquery(symbolArray,function(symbolObjectArray){
		async.eachSeries(symbolObjectArray,
			function (currentSymbol, cbEachSymbol){
				var dateToInsert = new Date(currentSymbol.last_tradingday);
				var dateToInsertString = dateToInsert.toISOString().slice(0,10);
				var dateToday = new Date();
				var dateTodayString = dateToday.toISOString().slice(0,10);
				//var dividend = currentSymbol.dividend === 'N/A'? 0: currentSymbol.dividend;
				//var pe = currentSymbol.pe === 'N/A'? 0: currentSymbol.pe;
				//var eps = currentSymbol.eps === 'N/A'? 0: currentSymbol.eps;
				var queryString = "INSERT into company_data (symbol, price, dividend, pe, eps, last_tradingday, last_update) values ('"
					+ currentSymbol.symbol + "'," + currentSymbol.price + ",'" + currentSymbol.dividend + "','" + currentSymbol.pe + "','" + currentSymbol.eps + "','" + dateToInsertString + "','"+dateTodayString+"')"
					+ " ON DUPLICATE KEY UPDATE price = "+ currentSymbol.price+",dividend = '" + currentSymbol.dividend + "', pe = '"+currentSymbol.pe+"', eps = '"+currentSymbol.eps + "', last_tradingday = '"+dateToInsertString+"', last_update = '"+dateTodayString+"'";
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

module.exports = IDStock_UpdateCompanyData;