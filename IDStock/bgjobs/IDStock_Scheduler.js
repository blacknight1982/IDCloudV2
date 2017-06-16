/**
 * Created by John Liu on 05/08/2016.
 */
require('events').EventEmitter.defaultMaxListeners = Infinity;
var CronJob = require('cron').CronJob;
var IDStock_UpdateCompanyData = require('./IDStock_UpdateCompanyData');
var IDStock_UpdatePriceHistory = require('./IDStock_UpdatePriceHistory');
var IDStock_UpdateERCalendar = require('./IDStock_UpdateERCalendar');
var IDStock_UpdateLastDayForCompanyPriceHistory = require('./IDStock_UpdateLastDayForCompanyPriceHistory');
var IDStock_UpdateCompanyPriceHistory = require('./IDStock_UpdateCompanyPriceHistory');
var IDStock_UpdateERHistoryPrice = require('./IDStock_UpdateERHistoryPrice');
var logger = require('../modules/logging/logger')(module);
var db = require('../modules/persistence/db');


db.connect(db.MODE_PRODUCTION, function(err) {
	  if (err) {
		logger.log('error','Unable to connect to MySQL.');
	    process.exit(1);
	  } else {
		  /*
		   * Runs every weekday (Tuesday through Saturday)
		   * at 00:00:00 AM. It does not run on Monday or Sunday
		   */
		  var IDStock_UpdateCompanyDataJob = new CronJob('00 00 00 * * 2-6', IDStock_UpdateCompanyData, function() {
		  	console.log('IDStock_UpdateStockPrice job stopped');
		  }, true
		  );
		  
		  /*
		   * Runs every weekday (Tuesday through Saturday)
		   * at 01:00:00 AM. It does not run on Monday or Sunday
		   */
		  var IDStock_UpdateLastDayForCompanyPriceHistoryJob = new CronJob('00 00 01 * * 2-6', IDStock_UpdateLastDayForCompanyPriceHistory, function() {
		  	console.log('IDStock_UpdateLastDayForCompanyPriceHistory job stopped');
		  }, true
		  );

		  /*
		   * Runs every weekday (Tuesday through Saturday)
		   * at 01:00:00 AM. It does not run on Monday or Sunday
		   */
		  /*var IDStock_UpdatePriceHistoryJob = new CronJob('00 00 01 * * 2-6', IDStock_UpdatePriceHistory, function() {
		  	console.log('IDStock_UpdatePriceHistory job stopped');
		  }, true
		  );*/

		  /*
		   * Runs every weekday (Tuesday through Saturday)
		   * at 04:00:00 AM. It does not run on Monday or Sunday
		   */
		  var IDStock_UpdateERCalendarJob = new CronJob('00 00 04 * * 2-6', IDStock_UpdateERCalendar, function() {
		  	console.log('IDStock_UpdateERCalendar job stopped');
		  }, true
		  );
		  
		  /*
		   * Runs every Sunday 
		   * at 00:00:00 AM. It does not run on Monday or Sunday
		   * Removed, company price history is from IB job
		   */
		  /*var IDStock_UpdateCompanyPriceHistoryJob = new CronJob('00 00 00 * * 7', IDStock_UpdateCompanyPriceHistory, function() {
		  	console.log('IDStock_UpdateCompanyPriceHistory job stopped');
		  }, true
		  );*/
		  
		  /*
		   * Runs every Sunday 
		   * at 00:00:00 AM. It does not run on Monday or Sunday
		   */
		  var IDStock_UpdateERHistoryPriceJob = new CronJob('00 00 03 * * 7', IDStock_UpdateERHistoryPrice, function() {
		  	console.log('IDStock_UpdateERHistoryPrice job stopped');
		  }, true
		  );
		  
		  logger.log('info','Scheduler Started!');
	  }
	});

