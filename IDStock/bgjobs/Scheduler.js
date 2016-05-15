/**
 * Created by John Liu on 05/08/2016.
 */

var CronJob = require('cron').CronJob;
var IDStock_UpdateStockPrice = require('./IDStock_UpdateStockPrice');
var IDStock_UpdatePriceHistory = require('./IDStock_UpdatePriceHistory');

/*
 * Runs every weekday (Tuesday through Saturday)
 * at 00:00:00 AM. It does not run on Monday or Sunday
 */
var job1 = new CronJob('00 00 00 * * 2-6', IDStock_UpdateStockPrice, function() {
	console.log('IDStock_UpdateStockPrice job stopped');
}, true
);

/*
 * Runs every weekday (Tuesday through Saturday)
 * at 01:00:00 AM. It does not run on Monday or Sunday
 */
var job2 = new CronJob('00 00 01 * * 2-6', IDStock_UpdatePriceHistory, function() {
	console.log('IDStock_UpdatePriceHistory job stopped');
}, true
);