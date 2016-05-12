/**
 * Created by John Liu on 2/16/2016.
 */

var express = require('express');
var mysql = require('mysql');
var logger = require('../modules/logger')(module);
var yahoopricequeryhistory = require('../modules/yahoopricequeryhistory');
var quandlpricequeryhistory = require('../modules/quandlpricequeryhistory');
var async = require('async');
var decaycalc = require('../modules/decaycalc');
var router = express();

var mySQLPool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'ljh123',
    database: 'idstock'
});


/* GET home page. */
router.get('/', function (req, res, next) {
	
	var queryString = "SELECT symbol FROM etf_subject";
    
	var connection = mysql.createConnection(
	        {
	            host     : 'localhost',
	            user     : 'root',
	            password : 'ljh123',
	            database : 'idstock',
	        }
	    );
    connection.connect();
    
    connection.query(queryString, function(err, rows, fields) {
    	if (err) {
            logger.log('error',err);
        }
    	res.render('decaycalc', {title: 'ETF Decay Calculator',etfs: rows});
    });
    connection.end();
});

router.post('/', function (req, res, next) {
	var symbol = req.body.symbol;
	var fromDate = req.body.fromDate;
	var toDate = req.body.toDate;
	var subject;
	var correlation;
	
	if((symbol === '')||(fromDate==='')||(toDate ==='')){
		res.json({value:'Please fill out all the necessary information'});
	}
	else{
	
		var queryString = "SELECT * FROM etf_subject where symbol = '"+symbol + "'";
		
		var connection = mysql.createConnection(
		        {
		            host     : 'localhost',
		            user     : 'root',
		            password : 'ljh123',
		            database : 'idstock',
		        }
		    );
	    connection.connect();
	    
	    connection.query(queryString, function(err, rows, fields) {
	    	if (err) {
	            logger.log('error',err);
	        }
	        if(rows.length===1){
	        	subject = rows[0].subject;
	            correlation = rows[0].correlation;
	            decaycalc(symbol,subject,fromDate,toDate,correlation,function(result){
	            	console.log(result);
	                res.json(result);
	            });
	        }
	    });
	    connection.end();
	}
});

module.exports = router;
