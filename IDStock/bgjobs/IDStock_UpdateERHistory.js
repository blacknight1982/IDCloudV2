/**
 * Created by John Liu on 04/24/2016.
 */
var request = require('request');
var mysql = require('mysql');
var async = require("async");
var db = require('../modules/db.js');
var nasdaqercalhistory = require('../modules/nasdaqercalhistory');
var logger = require('../modules/logger')(module);
var yahoopricequeryhistoryforcompany = require('../modules/yahoopricequeryhistoryforcompany');

var symbolArray = [];
var dateToday = new Date();
var dateTodayString = dateToday.toLocaleDateString().slice(0,10);

var IDStock_UpdateERHistory = function(){
	
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
	            	symbolArray = symbolArray.slice(0,11);
	            	logger.log('info',symbolArray);
	            }
	            cbGlobal();
	        });
	    },
	            
	    /*
	     * Step2: Query for Earning Calendar History into DB
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
	            	symbolArray = symbolArray.slice(0,11);
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
	    logger.log('info','cbGlobal all executed');
	});

};

function queryEarningCalIntoDB(cbGlobal){
	logger.log("info","Entering queryEarningCalIntoDB...");
	async.eachSeries(symbolArray,function (currentSymbol, cbEachSymbol){
		nasdaqercalhistory(currentSymbol.symbol,
				function(ercalHistoryArray){
					if(ercalHistoryArray.length>0){
						var queryString = "insert into company_ercal_history (symbol, fquarter, rdate, eps, epsf, surprise, last_update) values ";
		                for(i=0;i<ercalHistoryArray.length;i++){
		                	queryString = queryString + "('" + currentSymbol.symbol + "','" + ercalHistoryArray[i].fQuarter + "','" + ercalHistoryArray[i].rDate + "','" + 
		                	ercalHistoryArray[i].eps + "','" + ercalHistoryArray[i].epsf + "','" + ercalHistoryArray[i].surprise + "','" + dateTodayString +"')," 
		                }
		                queryString = queryString.substr(0, queryString.length - 1);
		                queryString = queryString + " ON DUPLICATE KEY UPDATE symbol = '"+ currentSymbol.symbol + "', last_update = '" + dateTodayString + "'";
		                logger.log('info',queryString);
		                db.get().query(queryString, function (error, rows, results) {
		                	if (error) {
		                        logger.log('error',error);
		                        throw error;
		                    }
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
		    	yahoopricequeryhistoryforcompany(currentSymbol.symbol,start_date,end_date,function(returnPriceArray){
		    		priceArray = returnPriceArray;
		    		cbGlobal2();
		    	});

		    },
		    
		    /*
		     * Step3: Find price and update DB
		     */
		    step3: function(cbGlobal2){
		    	logger.log("info","Step 3");
		    	for(var i=0;i<erDates.length;i++){
		    		for(var j=0;j<priceArray.length;j++){
		    			if(erDates[i].rdate.toLocaleString().slice(0,10) === priceArray[j].date){
		    				var queryString = "UPDATE company_ercal_history set price_last = "+ 
		    				priceArray[j-1].adjClose + ", price_erday = " + priceArray[j].adjClose + ", price_next = " + 
		    				priceArray[j+1].adjClose + ", last_update = '" + dateTodayString + "'"
		    				+ " where symbol = '" + currentSymbol.symbol+"' and rdate = '" + erDates[i].rdate.toLocaleString().slice(0,10) +"'";
		    				logger.log("info",queryString);
		    				
		    				db.get().query(queryString, function (error, rows, results) {
			                	if (error) {
			                        logger.log('error',error);
			                        throw error;
			                	}
			                });
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

module.exports = IDStock_UpdateERHistory;