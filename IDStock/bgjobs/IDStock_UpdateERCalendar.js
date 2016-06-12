/**
 * Created by John Liu on 04/24/2016.
 */
var request = require('request');
var mysql = require('mysql');
var async = require("async");
var nasdaqercal = require('../modules/nasdaqercal');
var logger = require('../modules/logger')(module);

var symbolArray = [];

var mySQLPool;

var IDStock_UpdateERCalendar = function(){
	
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
            var queryString = 'SELECT symbol FROM company_tickers';
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
        queryEarningCalIntoDB(cbGlobal);
    }
},function (err, results) {
    logger.log('info','cb level2 all executed');
    mySQLPool.end();
});
}

function queryEarningCalIntoDB(cbGlobal){
	logger.log("info","Entering queryEarningCalIntoDB...");
	async.eachSeries(symbolArray,function (currentSymbol, cbEachSymbol){
		nasdaqercal(currentSymbol.symbol,
				function(resultSymbol){
					mySQLPool.getConnection(function (err, conn) {
		                if (err) throw err;
		                var queryString = "insert into company_earning_cal (symbol, erdate, erdetails) values ('"+resultSymbol.symbolName+"','"+resultSymbol.erDate+"','"+resultSymbol.erDetails+"')"
		                + " ON DUPLICATE KEY UPDATE erdate = '"+resultSymbol.erDate + "', erdetails = '"+resultSymbol.erDetails+"'";
		                logger.log('info',queryString);
		                conn.query(queryString, function (error, rows, results) {
		                	if (error) {
		                        logger.log('error',error);
		                        throw error;
		                    }
		                });
		                conn.release();
		                cbEachSymbol();
					});
				});
	},
	function (err){
		cbGlobal();
	});
}

module.exports = IDStock_UpdateERCalendar;