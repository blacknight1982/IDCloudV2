/**
 * Created by John Liu on 05/09/2016.
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
	
	mySQLPool.getConnection(function (err, conn) {
        if (err) {
        	throw err;
        }
        logger.log('info', queryString);
        conn.query(queryString, function(err, rows, fields) {
        	if (err) {
                logger.log('error',err);
            }
        	res.render('chart', {title: 'ETF Decay Calculator',etfs: rows});
        });
        conn.release();
    });
});

router.post('/', function (req, res, next) {
	var symbol = req.body.symbol;
	var fromDate = req.body.fromDate;
	var toDate = req.body.toDate;
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
				console.log(queryString);
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
				    	console.log(subject);
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
				console.log(queryString);
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
				    		response.target.push(colume);
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
				console.log(queryString);
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
				    		response.subject.push(colume);
				    	}
				        cbsteps();
			        });
			        conn.release();
			    });
			},
			
			step4:function(cbsteps){
				var targetStartDate = response.target[0][0];
				var targetToDate = response.target[response.target.length-1][0];
				var subjectStartDate = response.subject[0][0];
				var subjectToDate = response.subject[response.subject.length-1][0];
				var targetStartPrice = response.target[0][1];
				var targetToPrice = response.target[response.target.length-1][1];
				var subjectStartPrice = response.subject[0][1];
				var subjectToPrice =  response.subject[response.subject.length-1][1];
				
				response.decayResults.targetStartDate = targetStartDate;
				response.decayResults.targetToDate = targetToDate;
				response.decayResults.subjectStartDate = subjectStartDate;
				response.decayResults.subjectToDate = subjectToDate;
				response.decayResults.targetStartPrice = targetStartPrice;
				response.decayResults.targetToPrice = targetToPrice;
				response.decayResults.subjectStartPrice = subjectStartPrice;
				response.decayResults.subjectToPrice = subjectToPrice;
				response.correlation = correlation;
				
				var subjectIncrease = parseFloat(subjectToPrice)/parseFloat(subjectStartPrice) - 1;
				var actualTargetIncrease = parseFloat(targetToPrice)/parseFloat(targetStartPrice) - 1;
				
				response.decayResults.subjectIncrease = subjectIncrease;
				response.decayResults.actualTargetIncrease = actualTargetIncrease;
				
				if((targetStartDate===subjectStartDate)&&(targetToDate===subjectToDate)){
					var tradingDays = response.target.length-1;
					var subjectAverageIncrease = Math.pow((subjectIncrease + 1), 1/tradingDays) - 1;
					var targetAverageIncrease = subjectAverageIncrease*parseFloat(correlation);
					
					var targetIncreaseFactor = Math.pow((targetAverageIncrease + 1), tradingDays);
					var targetIncrease = targetIncreaseFactor - 1;
					
					var deserveValue = targetIncreaseFactor * parseFloat(targetStartPrice);
					var actualValue = parseFloat(targetToPrice);
					
					response.decayResults.subjectIncrease = subjectIncrease;
					response.decayResults.targetIncrease = targetIncrease;
					response.decayResults.tradingDays = tradingDays;
					
					if(targetIncrease > -1){
						response.decayResults.decay = 1-(actualValue/deserveValue);
						response.decayResults.reason = 'Calculation Successful!';
					}
					else{
						response.decayResults.reason = 'Subject depreciated too much! Cannot calculate decay.';
					}
				}
				else{
					response.decayResults.reason = 'Date range mis-match. Cannot calculate decay.';
				}
				cbsteps();
			        
			}
		},function(){
			logger.log('info',response.decayResults);
			res.json(response);
		});
	}
});

module.exports = router;
