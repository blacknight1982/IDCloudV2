/**
 * Created by John Liu on 2/16/2016.
 */

var express = require('express');
var async = require("async");
var logger = require('../modules/logging/logger')(module);
var router = express();
var db = require('../modules/persistence/db');

/* GET home page. */
router.get('/:industry', function (req, res, next) {
	
	var companyRows = [];
	

	async.series({
		/*
		 * Step 1 read future ER calendar
		 */
	    step1: function(cbGlobal){
	        
	    	var queryString_future = "SELECT erdate, symbol,name,sector,market_cap,price,eps,erdetails FROM company_basic_ercal where erdate between DATE_SUB(NOW(), INTERVAL 1 DAY) and DATE_ADD(NOW(), INTERVAL 1 MONTH) and erdate <> '0000-00-00' and industry = '" + req.params.industry  +"' order by erdate desc";
	    	logger.log('info',queryString_future);	
	    	db.get().query(queryString_future, function(err, rows, fields) {
	            if (err) throw err;

	            for (var i in rows) {
	                rows[i].rdate = rows[i].erdate.toISOString().slice(0,10);
	                rows[i].price_erday = rows[i].price;
	                companyRows.push(rows[i]);
	            }
	            logger.log('info',rows);   
	            cbGlobal();
	        });
	    },
	            
	    /*
	     * Step2: read past ER calendar
	     */
	    step2: function(cbGlobal){
	    	var queryString_history = "SELECT rdate, symbol, name, sector, market_cap ,eps, epsf, surprise, price_preer1, price_erday, price_next,percent_day1,percent_day2,percent_twoday FROM idstock.company_basic_ercal_enhanced where rdate between DATE_SUB(NOW(), INTERVAL 5 MONTH) and DATE_SUB(NOW(), INTERVAL 1 DAY) and industry = '" + req.params.industry  +"' order by rdate desc";
	    	logger.log('info',queryString_history);	
	        db.get().query(queryString_history, function(err, rows, fields) {
	            if (err) throw err;

	            for (var i in rows) {
	                rows[i].rdate = rows[i].rdate.toISOString().slice(0,10);
	                companyRows.push(rows[i]);
	            }
	            logger.log('info',rows);
	            cbGlobal();
	            
	        });
	    }
		},function (err, results) {
		    logger.log('info','cb level2 all executed');
		    res.render('ercalhistory', {title: 'IDCloud Trading Tool', industry:req.params.industry ,companyList: companyRows});
		});
});

module.exports = router;