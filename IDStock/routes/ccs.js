/**
 * Created by John Liu on 2/16/2016.
 */

var express = require('express');
var async = require("async");
var logger = require('../modules/logging/logger')(module);
var router = express();
var db = require('../modules/persistence/db');

/* GET home page. */
router.get('/', function (req, res, next) {
	
	var companyRows = [];
	

	async.series({
		/*
		 * Step 1 read future ER calendar
		 */
	    step1: function(cbGlobal){
	        
	    	/*var queryString_future = "SELECT erdate, symbol,name,sector,market_cap,price,eps,erdetails FROM company_basic_ercal where erdate <= DATE_ADD(NOW(), INTERVAL 1 MONTH) and erdate <> '0000-00-00' and industry = '" + req.params.industry  +"' order by erdate desc";
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
	        });*/
	    	cbGlobal();
	    },
	            
	    /*
	     * Step2: read past ER calendar
	     */
	    step2: function(cbGlobal){
	    	var queryString_enhanced = "SELECT rdate, symbol, name, market_cap, industry, eps, epsf, surprise, " +
	    			"price_preer5, price_preer4,price_preer3,price_preer2,price_preer1,percent_pre5day, price_erday, price_next, percent_twoday FROM idstock.company_basic_ercal_enhanced where (rdate between DATE_SUB(NOW(), INTERVAL 5 MONTH) and DATE_ADD(NOW(), INTERVAL 2 MONTH)) and china_cs = 1 order by rdate desc";
	    	logger.log('info',queryString_enhanced);	
	        db.get().query(queryString_enhanced, function(err, rows, fields) {
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
		    res.render('ccs', {title: 'IDCloud Trading Tool', industry:req.params.industry ,companyList: companyRows});
		});
});

module.exports = router;