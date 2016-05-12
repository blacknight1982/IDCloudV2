/**
 * Created by John Liu on 05/08/2016.
 */

var CronJob = require('cron').CronJob;
var IDStock_UpdateStockPrice = require('./IDStock_UpdateStockPrice');
var IDStock_UpdatePriceHistory = require('./IDStock_UpdatePriceHistory');

/*
 * Runs every weekday (Monday through Friday)
 * at 11:30:00 AM. It does not run on Saturday
 * or Sunday.
 */
/*var job = new CronJob('00 00 00 * * 1-6', IDStock_UpdateStockPrice, function() {
	console.log('job stopped');
}, true  Start the job right now 
);*/

IDStock_UpdatePriceHistory();