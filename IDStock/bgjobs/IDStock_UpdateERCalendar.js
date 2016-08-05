/**
 * Created by John Liu on 04/24/2016.
 */
var request = require('request');
var async = require("async");
var nasdaqercal = require('../modules/nasdaqercal');
var yahoopricequeryhistoryforcompany = require('../modules/yahoopricequeryhistoryforcompany');
var db = require('../modules/db.js');
var logger = require('../modules/logger')(module);

var symbolArray = [];
var dateToday = new Date();
var dateTodayString = dateToday.toLocaleDateString().slice(0,10);

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
        queryEarningCalIntoDB(cbGlobal);
    },
    
    /*
	 * Step 3 select symbles with er price not updated  
	 */
	step3: function(cbGlobal){
    	var queryString = "SELECT distinct symbol, price_erday FROM idstock.company_ercal_history  where price_erday IS NULL or last_update IS NULL group by symbol";
    	logger.log("info",queryString);
    	db.get().query(queryString, function (error, rows, results) {
            if (error) {
                logger.log('error',error);
                throw error;
            }
            else {
            	symbolArray = rows;
            	//symbolArray = symbolArray.slice(0,2);
            }
            cbGlobal();
        });
    },
    
    /*
     * Step4: Price for Earning Calendar History
     */
    step4: function(cbGlobal){
        queryPriceHistoryIntoDB(cbGlobal);
    }
    
	},function (err, results) {
	    logger.log('info','cb level2 all executed');
	});
};

function queryPriceHistoryIntoDB(cbGlobal){
	logger.log("info","Entering queryPriceHistoryIntoDB...");
	
	async.eachSeries(symbolArray,function (currentSymbol, cbEachSymbol){
		var start_date = '';
		var end_date = '';
		var erDates = [];
		var priceArray = [];
		
		async.series({
			
			/*
			 * Step 1 get start_date and end_date for each symbol 
			 */
		    step1: function(cbGlobal2){
		    	var queryString = "SELECT symbol, rdate FROM company_ercal_history where symbol='"+currentSymbol.symbol+"' order by rdate asc";
		    	logger.log("info",queryString);
		    	db.get().query(queryString, function (error, rows, results) {
		            if (error) {
		                logger.log('error',error);
		                throw error;
		            }
		            else {
		            	if(rows.length > 0){
			            	erDates = rows;
			            	start_date = new Date(rows[0].rdate);
			            	end_date = new Date(rows[rows.length-1].rdate);
			            	start_date.setDate(start_date.getDate() - 7);
			            	end_date.setDate(end_date.getDate() + 7);
			            	start_date = start_date.toLocaleString().slice(0,10);
			            	end_date = end_date.toLocaleString().slice(0,10);	
		            	}
		            }
		            cbGlobal2();
		        });
		    },
		            
		    /*
		     * Step2: Query for price history into DB
		     */
		    step2: function(cbGlobal2){
		    	setTimeout(function(){
			    	yahoopricequeryhistoryforcompany(currentSymbol.symbol,start_date,end_date,function(returnPriceArray){
			    		priceArray = returnPriceArray;
			    		cbGlobal2();
			    	});
		    	},1000);

		    },
		    
		    /*
		     * Step3: Find price and update DB
		     */
		    step3: function(cbGlobal2){
		    	logger.log("info","Step 3");
		    	var j = priceArray.length-1;
		    	for(var i=0;i<erDates.length;i++){
		    		for(;j>=0;j--){
		    			if(erDates[i].rdate.toLocaleString().slice(0,10) === priceArray[j].date){
		    				var queryString = "UPDATE company_ercal_history set price_last = "+ 
		    				priceArray[j+1].adjClose + ", price_erday = " + priceArray[j].adjClose + ", price_next = " + 
		    				priceArray[j-1].adjClose + ", last_update = '" + dateTodayString + "'"
		    				+ " where symbol = '" + currentSymbol.symbol+"' and rdate = '" + erDates[i].rdate.toLocaleString().slice(0,10) +"'";
		    				logger.log("info",queryString);
		    				
		    				db.get().query(queryString, function (error, rows, results) {
			                	if (error) {
			                        logger.log('error',error);
			                        throw error;
			                	}
			                });
		    				break;
		    			}
		    		}
		    	}
		    	cbGlobal2();
		    }
		    
		},function (err, results) {
		    logger.log('info','cbGlobal2 all executed');
		    cbEachSymbol();
		});
	},
	function (err){
		cbGlobal();
	});
}


function queryEarningCalIntoDB(cbGlobal){
	logger.log("info","Entering queryEarningCalIntoDB...");
	var dateToday = new Date();
	var dateTodayString = dateToday.toLocaleDateString().slice(0,10);
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