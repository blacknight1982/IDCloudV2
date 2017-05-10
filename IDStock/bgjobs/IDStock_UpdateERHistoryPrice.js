/**
 * Created by John Liu on 05/06/2017.
 */
var request = require('request');
var async = require('async');
var nasdaqercal = require('../modules/api/nasdaqercal');
var yahoopricequeryhistoryforcompany = require('../modules/api/yahoopricequeryhistoryforcompany');
var db = require('../modules/persistence/db');
var logger = require('../modules/logging/logger')(module);

var symbolArray = [];
var dateToday = new Date();
var dateTodayString = dateToday.toISOString().slice(0,10);

var IDStock_UpdateERHistoryPrice = function(){
	
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
	 * Step 2 select symbles with er price not updated  
	 */
	step2: function(cbGlobal){
    	var queryString = "SELECT distinct symbol, price_erday FROM idstock.company_ercal_history where price_erday IS NULL " +
    			"or price_preer IS NULL " +
    			"or last_update IS NULL " +
    			"group by symbol";
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
     * Step3: Update History Price for Earning Calendar History
     */
    step3: function(cbGlobal){
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
		    	try{
			    	for(var i=0;i<erDates.length;i++){
			    		for(;j>=0;j--){
			    			if((erDates[i].rdate.toISOString().slice(0,10) === priceArray[j].date)||
			    			(erDates[i].rdate <= new Date(priceArray[j].date)))
			    			{
			    				var queryString = "UPDATE company_ercal_history set price_preer = "+ priceArray[j+1].close + 
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

module.exports = IDStock_UpdateERHistoryPrice;