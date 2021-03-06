/**
 * Created by John Liu on 05/08/2016.
 */

process.setMaxListeners(0);
var IDStock_UpdatePriceHistory = require('./IDStock_UpdatePriceHistory');
var IDStock_UpdateERCalendar = require('./IDStock_UpdateERCalendar');
var IDStock_UpdateCompanyData = require('./IDStock_UpdateCompanyData');
var IDStock_UpdateCompanyPriceHistory = require('./IDStock_UpdateCompanyPriceHistory');
var IDStock_UpdateCompanies = require('./IDStock_UpdateCompanies');
var IDStock_UpdateERHistoryPrice = require('./IDStock_UpdateERHistoryPrice');
var IDStock_UpdateLastDayForCompanyPriceHistory = require('./IDStock_UpdateLastDayForCompanyPriceHistory');

var db = require('../modules/persistence/db');

db.connect(db.MODE_PRODUCTION, function(err) {
	  if (err) {
	    console.log('Unable to connect to MySQL.');
	    process.exit(1);
	  } else {
		  //done 04/30
		  //IDStock_UpdateCompanies();
		  
		  //done 05/13
		  //IDStock_UpdateCompanyData();
		  
		  //done 05/13
		  //IDStock_UpdatePriceHistory();
		  
		  //done 07/30
		  //IDStock_UpdateERCalendar();
		  
		  //done 07/29
		  //IDStock_UpdateLastDayForCompanyPriceHistory();
	  }
});