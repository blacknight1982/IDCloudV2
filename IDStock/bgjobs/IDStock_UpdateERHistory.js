/**
 * Created by John Liu on 04/24/2016.
 */
var request = require('request');
var mysql = require('mysql');
var async = require("async");
var nasdaqercalhistory = require('../modules/nasdaqercalhistory');
var logger = require('../modules/logger')(module);

var symbolArray = [];

var mySQLPool = mysql.createPool({
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

function queryEarningCalIntoDB(cbGlobal){
	logger.log("info","Entering queryEarningCalIntoDB...");
	async.eachSeries(symbolArray,function (currentSymbol, cbEachSymbol){
		nasdaqercalhistory(currentSymbol.symbol,
				function(ercalHistoryArray){
					if(ercalHistoryArray.length>0){
						mySQLPool.getConnection(function (err, conn) {
			                if (err) throw err;
			                var queryString = "insert into company_ercal_history (symbol, fquarter, rdate, eps, epsf, surprise) values ";
			                for(i=0;i<ercalHistoryArray.length;i++){
			                	queryString = queryString + "('" + currentSymbol.symbol + "','" + ercalHistoryArray[i].fQuarter + "','" + ercalHistoryArray[i].rDate + "','" + 
			                	ercalHistoryArray[i].eps + "','" + ercalHistoryArray[i].epsf + "','" + ercalHistoryArray[i].surprise + "')," 
			                }
			                queryString = queryString.substr(0, queryString.length - 1);
			                queryString = queryString + " ON DUPLICATE KEY UPDATE symbol = '"+ currentSymbol.symbol + "'";
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
					}
					else{
						cbEachSymbol();
					}
				});
	},
	function (err){
		cbGlobal();
	});
}