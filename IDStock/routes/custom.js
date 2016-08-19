/**
 * Created by John Liu on 8/14/2016.
 */

var express = require('express');
var logger = require('../modules/logger')(module);
var router = express();
var db = require('../modules/db');
var async = require("async");
var IDStock_UpdateCustomCompany = require('../modules/IDStock_UpdateCustomCompany');

router.get('/', function (req, res, next) {
        res.render('custom', {title: 'IDCloud Trading Tool'});
});

router.get('/all', function (req, res, next) {
	var queryString = "SELECT symbol,name,market_cap,ipoyear,sector,industry,erdate,erdetails,price,pe,eps FROM company_tickers_ercal where custom = 1 order by erdetails"
    logger.log('info',queryString);
    
    db.get().query(queryString, function(err, rows, fields) {
        if (err) throw err;

        async.eachSeries(rows,function (row, cbEachRow){
        	row.erdate = row.erdate.toLocaleString().slice(0,10);
        	row.market_cap = Math.floor(row.market_cap);
        	var companyRows = [];
        	var queryStringHistory = "SELECT rdate ,eps, epsf, surprise, price_last, price_erday, price_next,percent_day1,percent_day2,percent_twoday FROM idstock.company_tickers_ercal_history where symbol = '" + row.symbol  +"' order by rdate desc";
        	logger.log('info',queryStringHistory);	
        	db.get().query(queryStringHistory, function(err, historyRows, fields) {
	            if (err) throw err;

	            for (var i in historyRows) {
	            	historyRows[i].rdate = historyRows[i].rdate.toLocaleString().slice(0,10);
	                companyRows.push(historyRows[i]);
	            }
	            row.erHistory = companyRows;
	            cbEachRow();
	        });    
        	
        },
        function (err){
        	var response = {er_companies:rows};
        	logger.log('info',response);	
            res.json(response);
    	});
    });
});

router.post('/:customSymbol', function (req, res, next) {
	var customSymbol = req.params.customSymbol;
	IDStock_UpdateCustomCompany(customSymbol,function(object){
		logger.log('info',object);
		res.json(object);
		logger.log('info',customSymbol+ ' Added');
	});
});

module.exports = router;
