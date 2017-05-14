/**
 * Created by John Liu on 04/24/2016.
 */
var request = require('request');
var async = require("async");
var nasdaqercal = require('../modules/api/nasdaqercal');
var yahoopricequeryhistoryforcompany = require('../modules/api/yahoopricequeryhistoryforcompany');
var db = require('../modules/persistence/db');
var logger = require('../modules/logging/logger')(module);

var symbolArray = [];
var dateToday = new Date();
var dateTodayString = dateToday.toISOString().slice(0,10);

var IDStock_UpdateERCalendar = function(){
	
async.series({
	/*
	 * Step 1 read all company symbols from DB company_basic
	 */
    step1: function(cbGlobal){
        
    	var queryString = 'SELECT symbol FROM company_basic';
    	
    	db.get().query(queryString, function (error, rows, results) {
            if (error) {
                logger.log('error',error);
                throw error;
            }
            else {
            	symbolArray = rows;
            	//symbolArray = symbolArray.slice(0,1);
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
	var dateToday = new Date();
	var dateTodayString = dateToday.toISOString().slice(0,10);
	async.eachSeries(symbolArray,function (currentSymbol, cbEachSymbol){
		setTimeout(function(){
			nasdaqercal(currentSymbol.symbol,
					function(erResult){
								
						var queryStringForecast = "insert into company_earning_cal (symbol, erdate, erdetails, last_update) values ('"+erResult.forecast.symbolName+"','"+erResult.forecast.erDate+"','"+erResult.forecast.erDetails+"','"+dateTodayString+"')" 
			            + " ON DUPLICATE KEY UPDATE erdate = '"+erResult.forecast.erDate + "', erdetails = '"+erResult.forecast.erDetails+"', last_update = '"+dateTodayString + "'";
						logger.log('info',queryStringForecast);
						var queryStringHistory = "insert into company_ercal_history (symbol, fquarter, rdate, eps, epsf, surprise) values ";
		                						
						if(erResult.history.length>0){
							for(i=0;i<erResult.history.length;i++){
			                	queryStringHistory = queryStringHistory + "('" + currentSymbol.symbol + "','" + erResult.history[i].fQuarter + "','" + erResult.history[i].rDate + "','" + 
			                	erResult.history[i].eps + "','" + erResult.history[i].epsf + "','" + erResult.history[i].surprise + "')," 
			                }
			                queryStringHistory = queryStringHistory.substr(0, queryStringHistory.length - 1);
			                queryStringHistory = queryStringHistory + " ON DUPLICATE KEY UPDATE symbol = '"+ currentSymbol.symbol  + "'";
			                logger.log('info',queryStringHistory);
			                
						}
						
						
						db.get().query(queryStringForecast, function (error, rows, results) {
			            	if (error) {
			                    logger.log('error',error);
			                    throw error;
			                }
			            	if(erResult.history.length>0){
			            		db.get().query(queryStringHistory, function (error, rows, results) {
				                	if (error) {
				                        logger.log('error',error);
				                        throw error;
				                    }
				                	cbEachSymbol();
				                });
			            		
			            	}else{
			            		cbEachSymbol();
			            	}
			            	
			            });
					});
		},1000);
	},
	function (err){
		cbGlobal();
	});
}

module.exports = IDStock_UpdateERCalendar;