/**
 * Created by John Liu on 05/08/2016.
 */

var CronJob = require('cron').CronJob;
var IDStock_UpdateStockPrice = require('./IDStock_UpdateStockPrice');
var IDStock_UpdatePriceHistory = require('./IDStock_UpdatePriceHistory');
var IDStock_UpdateERCalendar = require('./IDStock_UpdateERCalendar');
var db = require('../modules/db');


db.connect(db.MODE_PRODUCTION, function(err) {
	  if (err) {
	    console.log('Unable to connect to MySQL.');
	    process.exit(1);
	  } else {
		  /*
		   * Runs every weekday (Tuesday through Saturday)
		   * at 00:00:00 AM. It does not run on Monday or Sunday
		   */
		  var IDStock_UpdateStockPriceJob = new CronJob('00 00 00 * * 2-6', IDStock_UpdateStockPrice, function() {
		  	console.log('IDStock_UpdateStockPrice job stopped');
		  }, true
		  );

		  /*
		   * Runs every weekday (Tuesday through Saturday)
		   * at 01:00:00 AM. It does not run on Monday or Sunday
		   */
		  var IDStock_UpdatePriceHistoryJob = new CronJob('00 00 01 * * 2-6', IDStock_UpdatePriceHistory, function() {
		  	console.log('IDStock_UpdatePriceHistory job stopped');
		  }, true
		  );

		  var IDStock_UpdateERCalendarJob = new CronJob('00 00 01 * * 7', IDStock_UpdateERCalendar, function() {
		  	console.log('IDStock_UpdateERCalendar job stopped');
		  }, true
		  );
	  }
	});

