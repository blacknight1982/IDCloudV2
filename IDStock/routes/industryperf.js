/**
 * Created by John Liu on 05/09/2016.
 */

var express = require('express');
var logger = require('../modules/logger')(module);
var async = require('async');
var router = express();
var db = require('../modules/db');


/* GET home page. */
router.get('/', function (req, res, next) {
	
	var queryString = "SELECT industry, avg(100+percent_twoday)-100 as 'return', std(100+percent_twoday) as 'std', count(*) as 'count' FROM idstock.company_tickers_ercal_history where rdate >= DATE_SUB(NOW(), INTERVAL 2 MONTH) group by industry";
	db.get().query(queryString, function(err, rows, fields) {
    	if (err) {
            logger.log('error',err);
        }
    	res.render('industryperf', {title: 'Industry ER Performance', industries: rows});
    });
});

router.post('/', function (req, res, next) {
	
});

module.exports = router;
