/**
 * Created by John on 2/6/2016.
 * Updated by John on 8/14/2016.
 */
var request = require('request');
var csv_stream = require('csv-stream');
var async = require('async');
var db = require('../modules/persistence/db');
var logger = require('../modules/logging/logger')(module);

var companyArray = [];
var companyArrayCleansed = [];

var IDStock_UpdateCompanies = function(){

	// All of these arguments are optional.
	var csvReadOptions = {
	    delimiter: ',', // default is ,
	    endLine: '\n', // default is \n,
	    columns: ['symbol', 'name', 'lastSale', 'marketCap', 'ipoyear', 'sector', 'industry', 'summaryQuote'], // by default read the first line and use values found as columns
	    //escapeChar : '"', // default is an empty string
	    enclosedChar: '"' // default is an empty string
	};
	
	//var fstream = fs.createWriteStream('US_Tickers.csv');
	var requestURLs = ['http://www.nasdaq.com/screening/companies-by-name.aspx?letter=0&exchange=nasdaq&render=download',
	    'http://www.nasdaq.com/screening/companies-by-name.aspx?letter=0&exchange=nyse&render=download',
	    'http://www.nasdaq.com/screening/companies-by-name.aspx?letter=0&exchange=amex&render=download'];
	
	async.each(requestURLs,
	    function (requestURL, cb) {
	        var csvStream = csv_stream.createStream(csvReadOptions);
	        request(requestURL).pipe(csvStream)
	            .on('error', function (err) {
	            	logger.log('error',err);
	            })
	            .on('data', function (data) {
	                companyArray.push(data);
	            })
	            .on('end', function () {
	                logger.log('info',requestURL);
	                cb();
	            });
	    },
	    function (err) {
	        logger.log('info','Total company number before market cap filter: %d',companyArray.length);
	
	        async.series({
	        	/*
	        	 * Step1 clear the DB
	        	 */
	            step1: function(cblevel2){
	                
	                var queryString = "delete from company_tickers";
	                db.get().query(queryString, function (error, results) {
	                    if (error) {
	                        logger.log('error',error);
	                    }
	                    
	                    cblevel2();
	                });
	            },
	            
	            /*
	             * Step2: cleanse the data
	             */
	            step2: function(cblevel2){
	            	cleansingCompanyData(cblevel2);
	            },
	                    
	            /*
	             * Step3: update the DB company_tickers
	             */
	            step3: function(cblevel2){
	                outPutFilteredDataToDB_company_tickers(cblevel2);
	            }
	        },function (err, results) {
	            logger.log('info','cb level2 all executed');
	        });
	    }
	);

}

function cleansingCompanyData(cblevel2){
	for (var i = 0, len = companyArray.length; i < len; i++) {
		
        var makcap = companyArray[i].marketCap;
        var lastChar = makcap.substr(makcap.length - 1);
        var makcapval = makcap.substr(1, makcap.length - 2);
        if(makcap.charAt(0) === '$'){
        	if (lastChar === 'B'){
        		var filteredCompanyData = {symbol:companyArray[i].symbol.trim(), name:companyArray[i].name,
        				marketCap:makcapval * 1000, ipoyear: companyArray[i].ipoyear, sector:companyArray[i].sector,
        				industry:companyArray[i].industry};
        		companyArrayCleansed.push(filteredCompanyData);
        	}
        	else if (lastChar === 'M'){
        		var filteredCompanyData = {symbol:companyArray[i].symbol.trim(), name:companyArray[i].name,
        				marketCap:makcapval, ipoyear: companyArray[i].ipoyear, sector:companyArray[i].sector,
        				industry:companyArray[i].industry};
        		companyArrayCleansed.push(filteredCompanyData);
        	}
        }
    }
	cblevel2();
}


function outPutFilteredDataToDB_company_tickers(cblevel2) {
	var dateToday = new Date();
	var dateTodayString = dateToday.toISOString().slice(0,10);
    var queryString = "insert into company_tickers (symbol, name, market_cap, ipoyear, sector, industry, last_update) values ";
    for (var i = 0, len = companyArrayCleansed.length; i < len; i++) {
    	queryString = queryString + "('" + companyArrayCleansed[i].symbol + "','" + companyArrayCleansed[i].name + "'," + companyArrayCleansed[i].marketCap + ",'" +
    	companyArrayCleansed[i].ipoyear + "','" + companyArrayCleansed[i].sector + "','" + companyArrayCleansed[i].industry + "','" + dateTodayString +"'),";
    }
    queryString = queryString.substr(0, queryString.length - 1);
    queryString = queryString + "ON DUPLICATE KEY UPDATE last_update = '"+ dateTodayString+"'";
    logger.log('info','Query String is : %s',queryString);
    db.get().query(queryString, function (error, results) {
        if (error) {
            logger.log('error',error);
        }
        cblevel2();
    });
}

module.exports = IDStock_UpdateCompanies;
