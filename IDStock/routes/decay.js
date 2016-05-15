/**
 * Created by John Liu on 05/09/2016.
 */

var express = require('express');
var mysql = require('mysql');
var logger = require('../modules/logger')(module);
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
	
	mySQLPool.getConnection(function (err, conn) {
        if (err) {
        	throw err;
        }
        logger.log('info', queryString);
        conn.query(queryString, function(err, rows, fields) {
        	if (err) {
                logger.log('error',err);
            }
        	res.render('decay', {title: 'ETF Decay Calculator',etfs: rows});
        });
        conn.release();
    });
});

router.post('/', function (req, res, next) {
	var symbol = req.body.symbol;
	var fromDate = req.body.fromDate;
	var toDate = req.body.toDate;
	var targetArray = [];
	var subjectArray = [];
	var response = 
	{
			target : [],
			subject : [],
			targetSymbol:symbol,
			subjectSymbol:'',
			correlation:0,
			decayResults:{
				targetStartDate:'',
				targetToDate:'',
				targetStartPrice:0,
				targetToPrice:0,
				subjectStartDate:'',
				subjectToDate:'',
				subjectStartPrice:0,
				subjectToPrice:0,
				subjectIncrease:'N/A',
				targetIncrease:'N/A',
				actualTargetIncrease:'N/A',
				decay:'N/A',
				tradingDays:0,
				reason:'Calculation failed'
			}
	};
	
	var subject;
	var correlation;
	
	if(symbol === ''){
		res.json(response);
	}
	
	else{
		
		async.series({
			step1:function(cbsteps){
				var queryString = "SELECT subject, correlation FROM etf_subject where symbol = '"+symbol + "'";
				logger.log('info',queryString);
				mySQLPool.getConnection(function (err, conn) {
			        if (err) {
			        	throw err;
			        }
			        logger.log('info', queryString);
			        conn.query(queryString, function(err, rows, fields) {
			        	if (err) {
				            logger.log('error',err);
				        }
				    	subject = rows[0].subject;
				    	correlation = rows[0].correlation;
				    	response.subjectSymbol = subject;
				        cbsteps();
			        });
			        conn.release();
			    });
			},
			
			step2:function(cbsteps){
				var queryString = "SELECT * FROM price_history where symbol = '"+symbol + "'";
				if(fromDate !== ''){
					queryString = queryString + " and date >='" + fromDate +"'";
				}
				if(toDate !== ''){
					queryString = queryString + " and date <='" + toDate +"'";
				}
				mySQLPool.getConnection(function (err, conn) {
			        if (err) {
			        	throw err;
			        }
			        logger.log('info', queryString);
			        conn.query(queryString, function(err, rows, fields) {
			        	if (err) {
				            logger.log('error',err);
				        }
				        for(var i=0;i<rows.length;i++){
				    		var colume = [rows[i].date.toLocaleString().slice(0,10), rows[i].adj_close];
				    		var dailyValue = {
				    				date: rows[i].date.toLocaleString().slice(0,10),
				    				price: rows[i].adj_close
				    		};
				    		response.target.push(colume);
				    		targetArray.push(dailyValue);
				    	}
				        cbsteps();
			        });
			        conn.release();
			    });
			    
			},
			
			step3:function(cbsteps){
				var queryString = "SELECT * FROM price_history where symbol = '"+subject + "'";
				if(fromDate !== ''){
					queryString = queryString + " and date >='" + fromDate +"'";
				}
				if(toDate !== ''){
					queryString = queryString + " and date <='" + toDate +"'";
				}
				mySQLPool.getConnection(function (err, conn) {
			        if (err) {
			        	throw err;
			        }
			        logger.log('info', queryString);
			        conn.query(queryString, function(err, rows, fields) {
			        	if (err) {
				            logger.log('error',err);
				        }
				        for(var i=0;i<rows.length;i++){
				    		var colume = [rows[i].date.toLocaleString().slice(0,10), rows[i].adj_close];
				    		var dailyValue = {
				    				date: rows[i].date.toLocaleString().slice(0,10),
				    				price: rows[i].adj_close
				    		};
				    		response.subject.push(colume);
				    		subjectArray.push(dailyValue)
				    	}
				        cbsteps();
			        });
			        conn.release();
			    });
			},
			
			step4:function(cbsteps){
				response.decayResults = decaycalc(targetArray,subjectArray,correlation);
				logger.log('info',response.decayResults);
				cbsteps();
			        
			}
		},function(){
			logger.log('info',response.decayResults);
			res.json(response);
		});
	}
});

module.exports = router;
