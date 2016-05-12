/**
 * decaycalc - calculate the XXX ETF decay
 * Author John Liu
 * 04/30/2016
 */
var mysql = require('mysql');
var async = require('async');
var logger = require('./logger')(module);

var mySQLPool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'ljh123',
    database: 'idstock'
});

/*
 * symbol - symbol of target
 * subject - symbol of subject
 * startDate - yyyy-mm-dd as start date format
 * endDate - yyyy-mm-dd as end date format
 * correlation - the multiple of target to subject 
 * callback: take decay object as output parameter
 */
		
function decaycalc(symbol, subject, startDate, endDate, correlation,callback){
	var targetPriceStartDate = 0;
	var targetPriceEndDate = 0;
	var subjectPriceStartDate = 0;
	var subjectPriceEndDate = 0;
	var decay = {
			value:'N/A',
			targetPriceStartDate:0,
			targetPriceEndDate:0,
			subjectPriceStartDate:0,
			subjectPriceEndDate:0,
			reason:'Calculation failed. Cannot find price on specific date.'};
	var dbResults = [];
	
	async.series({
		/*
		 * Step1: query for target and subject history price
		 */
		step1: function(cbSteps){
			
			mySQLPool.getConnection(function (err, conn) {
		            if (err) {
		            	throw err;
		            }
		            var queryString = "select symbol, date, adj_close from price_history where symbol in ('"+symbol+"','"+subject+"') AND date in ('"+startDate+"','"+ endDate+"')";
		            logger.log('info', queryString);
		            conn.query(queryString, function (error, rows, results) {
		                if (error) {
		                    logger.log('error',error);
		                    throw error;
		                }
		                else {
		                	dbResults = rows;
		                	logger.log('info', dbResults);
		                }
		                cbSteps();
		            });
		            conn.release();
		        });
		},
		
		/*
		 * Step2: calculate decay
		 */
		step2: function(cbSteps){
			if(dbResults.length!=4){
				cbSteps();
			}
			
				else{
					for(var i=0;i<4;i++){
						dbResults[i].date = dbResults[i].date.toLocaleString().slice(0,10);
						if(dbResults[i].symbol === symbol){
							if(dbResults[i].date === startDate){
								targetPriceStartDate = dbResults[i].adj_close;
							}
							else if(dbResults[i].date === endDate){
								targetPriceEndDate = dbResults[i].adj_close;
							}
						}
						else if(dbResults[i].symbol === subject){
							if(dbResults[i].date === startDate){
								subjectPriceStartDate = dbResults[i].adj_close;
							}
							else if(dbResults[i].date === endDate){
								subjectPriceEndDate = dbResults[i].adj_close;
							}
						}
					}
				
				
				if(targetPriceStartDate!=0&&targetPriceEndDate!=0&&subjectPriceStartDate!=0&&subjectPriceEndDate!=0){
					
					var subjectIncrease = parseFloat(subjectPriceEndDate)/parseFloat(subjectPriceStartDate) - 1;
					var targetIncrease = subjectIncrease*parseFloat(correlation);
					var targetIncreaseFactor = subjectIncrease*parseFloat(correlation)+1;
					var deserveValue = targetIncreaseFactor * parseFloat(targetPriceStartDate);
					var actualValue = parseFloat(targetPriceEndDate);
					if(targetIncrease > -1){
						decay = {value:1-(actualValue/deserveValue),
								targetPriceStartDate:targetPriceStartDate,
								targetPriceEndDate:targetPriceEndDate,
								subjectPriceStartDate:subjectPriceStartDate,
								subjectPriceEndDate:subjectPriceEndDate,
								reason:'Calculation Successful!'};
					}
					else{
						decay.reason = 'Subject price devalued too much! Out of calculation range';
					}
				}
				cbSteps();
			}
		}
	},
	function (err, results) {
	    logger.log('info','cb level2 all executed');
	    //mySQLPool.end();
	    callback(decay);
	});
}

module.exports = decaycalc;