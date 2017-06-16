/**
 * Created by John Liu on 08/03/2016.
 */
var async = require("async");
var yahoopricequeryhistoryforcompany = require('../modules/api/yahoopricequeryhistoryforcompany');
var googlepricequeryhistoryforcompany = require('../modules/api/googlepricequeryhistoryforcompany');
var quandlpricequeryhistoryforcompany = require('../modules/api/quandlpricequeryhistoryforcompany');
var db = require('../modules/persistence/db');
var logger = require('../modules/logging/logger')(module);
	
var priceSourceArray=[];
var dateToday = new Date();
var dateTodayString = dateToday.toISOString().slice(0,10);
dateToday.setDate(dateToday.getDate() - 366);
var oneYearBeforeString = dateToday.toISOString().slice(0,10);
dateToday.setDate(dateToday.getDate() - 366);
var twoYearBeforeString = dateToday.toISOString().slice(0,10);
	
var IDStock_UpdateCompanyPriceHistory = function(){
	
	async.series({
		/*
		 * Step 0 - read all tickers from DB company_basic
		 */
	    step0: function(cbGlobal){
	        
	    	var queryString = 'SELECT symbol FROM company_basic';
	    	db.get().query(queryString, function (error, rows, results) {
                if (error) {
                    logger.log('error',error);
                    throw error;
                }
                else {
                	priceSourceArray = rows;
                	//symbolArray = symbolArray.slice(0,2);
                	logger.log('info',priceSourceArray);
                }
                cbGlobal();
            });
	    	
	    },
	    
	    /*
		 * Step 1 - delete all from DB company_price_history
		 */
	    step1: function(cbGlobal){
	        
	    	var queryString = 'delete FROM company_price_history';
	    	db.get().query(queryString, function (error, rows, results) {
                if (error) {
                    logger.log('error',error);
                    throw error;
                }
                cbGlobal();
            });
	    	
	    },
	
		/*
		 * Step 2 - Query history price from priceSourceArray and update DB
		 */
	    step2: function(cbGlobal){
	    	queryTickerPriceHistoryIntoDB(cbGlobal);
	    }
	},
		function (err, results) {
	    logger.log('info','cb level2 all executed');			
	});

};

function queryTickerPriceHistoryIntoDB(cbGlobal){
	logger.log("info","Entering queryTickerPriceHistoryIntoDB...");
	async.eachSeries(priceSourceArray,function(eachPriceSource,cbEachPriceSource){
		
		googlepricequeryhistoryforcompany(eachPriceSource.symbol,twoYearBeforeString,dateTodayString, function(historyPriceArray){
		
		setTimeout(function(){
			var queryString = 'insert into company_price_history (symbol, date, price, volume) values ';
			for(var i=0;i<historyPriceArray.length;i++){
				queryString = queryString + "('" + eachPriceSource.symbol + "','" + new Date(historyPriceArray[i].date).toISOString().slice(0,10) + "'," + historyPriceArray[i].adjClose + "," + historyPriceArray[i].volume + "),";
			}
			queryString = queryString.substr(0, queryString.length - 1);
			logger.log('info',queryString);
			db.get().query(queryString, function (error, results) {
	            if (error) {
	                logger.log('error',error);
	            }
	            cbEachPriceSource();
	        });
		},4000);
		
	});
		
	},
	function (err){
		cbGlobal();
	});
}

module.exports = IDStock_UpdateCompanyPriceHistory;