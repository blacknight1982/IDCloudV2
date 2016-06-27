/**
 * Created by John Liu on 04/24/2016.
 */
var request = require('request');
var async = require("async");
var nasdaqercal = require('../modules/nasdaqercal');
var db = require('../modules/db.js');
var logger = require('../modules/logger')(module);

var symbolArray = [];

var IDStock_UpdateERCalendar = function(){
	
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
            	logger.log('info',symbolArray);
            }
            cbGlobal();
        });
    },
            
    /*
     * Step2: Query for Earning Calendar into symbolArray
     */
    step2: function(cbGlobal){
        queryEarningCalIntoDB(cbGlobal);
    }
	},function (err, results) {
	    logger.log('info','cb level2 all executed');
	});
};

function queryEarningCalIntoDB(cbGlobal){
	logger.log("info","Entering queryEarningCalIntoDB...");
	async.eachSeries(symbolArray,function (currentSymbol, cbEachSymbol){
		nasdaqercal(currentSymbol.symbol,
				function(resultSymbol){
					var queryString = "insert into company_earning_cal (symbol, erdate, erdetails) values ('"+resultSymbol.symbolName+"','"+resultSymbol.erDate+"','"+resultSymbol.erDetails+"')"
		            + " ON DUPLICATE KEY UPDATE erdate = '"+resultSymbol.erDate + "', erdetails = '"+resultSymbol.erDetails+"'";
					logger.log('info',queryString);
					db.get().query(queryString, function (error, rows, results) {
		            	if (error) {
		                    logger.log('error',error);
		                    throw error;
		                }
		            	cbEachSymbol();
		            });
					
				});
	},
	function (err){
		cbGlobal();
	});
}

module.exports = IDStock_UpdateERCalendar;