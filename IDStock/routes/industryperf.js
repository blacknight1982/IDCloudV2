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
	
	var queryString = "SELECT * from industry_perf";
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
