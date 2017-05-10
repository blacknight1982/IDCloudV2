/**
 * Created by John Liu on 08/14/2016.
 */
var request = require('request');
var async = require("async");
var db = require('./persistence/db.js');
var logger = require('./logging/logger')(module);
var yahoocompanydataquery = require('./api/yahoocompanydataquery');
var nasdaqercal = require('./api/nasdaqercal');
var yahoocompanydataquery = require('./api/yahoocompanydataquery');
var yahoopricequeryhistoryforcompany = require('./api/yahoopricequeryhistoryforcompany');
var yqlcompanydataquery = require('./api/yqlcompanydataquery');

var customCompanyData;
var symbolArray = [];
var dateToday = new Date();
var dateTodayString = dateToday.toISOString().slice(0,10);


/*	Input: symbol which is stock symbol
 *  Output and callback:
 *  callback will take the customCompanyData as input
 */

var IDStock_UpdateCustomCompany = function(symbol, callback){
	
	symbolArray = [];
	symbolArray.push({symbol:symbol});
	customCompanyData = {
			symbol:symbol,
			companyData:{
				price:0,
				dividend:0,
				pe:0,
				eps:0
			},
			erResult:{}
	};
	var insertSymbol = false;
	
	
	async.series({

		/*
		 * Step 0: Verify symbol exist
		 */
		step0: function(cbGlobal){
			yqlcompanydataquery(symbolArray,function(returnArray){
				logger.log("info",returnArray);
				if((returnArray.length>0)&&returnArray[0].ebitda === ''){
					insertSymbol = false;
					cbGlobal();
				}
				else{
					insertSymbol = true;
					cbGlobal();
				}
			});	
	    },
	    
		/*
		 * Step 1 update custom company into company_basic
		 */
	    step1: function(cbGlobal){
	    	if(insertSymbol){

		    	var queryString = "insert into company_basic (symbol, custom) values ('"+ symbol +"',1) ON DUPLICATE KEY UPDATE custom = 1";
		    	logger.log('info',queryString);
		    	db.get().query(queryString, function (error, rows, results) {
	                if (error) {
	                    logger.log('error',error);
	                    throw error;
	                }
	                cbGlobal();
	            });
	    	}
	    	else{
	    		cbGlobal();
	    	}
	    },
	            
	    /*
	     * Step2: Query for basic data and update company_data
	     */
	    step2: function(cbGlobal){
	    	if(insertSymbol){
		    	yahoocompanydataquery(symbolArray,function(symbolObjectArray){
		    		async.eachSeries(symbolObjectArray,
		    			function (currentSymbol, cbEachSymbol){
		    				var dateToInsert = new Date(currentSymbol.last_tradingday);
		    				var dateToInsertString = dateToInsert.toISOString().slice(0,10);
		    				
		    				var queryString = "INSERT into company_data (symbol, price, dividend, pe, eps, last_tradingday, last_update) values ('"
		    					+ currentSymbol.symbol + "'," + currentSymbol.price + ",'" + currentSymbol.dividend + "','" + currentSymbol.pe + "','" + currentSymbol.eps + "','" + dateToInsertString + "','"+dateTodayString+"')"
		    					+ " ON DUPLICATE KEY UPDATE price = "+ currentSymbol.price+",dividend = '" + currentSymbol.dividend + "', pe = '"+currentSymbol.pe+"', eps = '"+currentSymbol.eps + "', last_tradingday = '"+dateToInsertString+"', last_update = '"+dateTodayString+"'";
		    				
		    				customCompanyData.companyData.price = currentSymbol.price;
		    				customCompanyData.companyData.dividend = currentSymbol.dividend;
		    				customCompanyData.companyData.pe = currentSymbol.pe;
		    				customCompanyData.companyData.eps = currentSymbol.eps;
		    					    				
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
	    	else{
	    		cbGlobal();
	    	}
	    },
	    
	    /*
	     * Step3: Query for ercal and update ercal and history
	     */
	    step3: function(cbGlobal){
	    	if(insertSymbol){
		    	async.eachSeries(symbolArray,function (currentSymbol, cbEachSymbol){
	    			nasdaqercal(currentSymbol.symbol,
						function(erResult){
					
	    					customCompanyData.erResult = erResult;
									
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
		    	},
		    	function (err){
		    		cbGlobal();
		    	});
	    	}
	    	else{
	    		cbGlobal();
	    	}
	    },
	    
	    /*
	     * Step4: Query history price for ercal history
	     */
	    step4: function(cbGlobal){
	    	if(insertSymbol){
	    		queryPriceHistoryIntoDB(cbGlobal);
	    	}
	    	else{
	    		cbGlobal();
	    	}
	    }
	    
	},function (err, results) {
	    logger.log('info','IDStock_UpdateCustomCompany all steps executed');
	    callback(customCompanyData);
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
			            	start_date = start_date.toISOString().slice(0,10);
			            	end_date = end_date.toISOString().slice(0,10);	
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
		    	var j = priceArray.length-1;
		    	try{
			    	for(var i=0;i<erDates.length;i++){
			    		for(;j>=0;j--){
			    			if(erDates[i].rdate.toISOString().slice(0,10) === priceArray[j].date){
			    				var queryString = "UPDATE company_ercal_history set price_last = "+ priceArray[j+1].close + 
			    				", open_erday = " + priceArray[j].open +
			    				", price_erday = " + priceArray[j].close + 
			    				", open_next = " + priceArray[j-1].open +
			    				", price_next = " + priceArray[j-1].close + 
			    				", last_update = '" + dateTodayString + "'"
			    				+ " where symbol = '" + currentSymbol.symbol+"' and rdate = '" + erDates[i].rdate.toISOString().slice(0,10) +"'";
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
		    	}
		    	catch(err){
		    		logger.log("error",err);
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

module.exports = IDStock_UpdateCustomCompany;