/**
 * Created by John Liu on 05/08/2016.
 */


var IDStock_UpdatePriceHistory = require('./IDStock_UpdatePriceHistory');
var IDStock_UpdateERCalendar = require('./IDStock_UpdateERCalendar');
var IDStock_UpdateCompanyData = require('./IDStock_UpdateCompanyData');
var IDStock_UpdateCompanyPriceHistory = require('./IDStock_UpdateCompanyPriceHistory');
var IDStock_UpdateCompanies = require('./IDStock_UpdateCompanies');

var db = require('../modules/db');

db.connect(db.MODE_PRODUCTION, function(err) {
	  if (err) {
	    console.log('Unable to connect to MySQL.');
	    process.exit(1);
	  } else {
		  //done 04/30
		  //IDStock_UpdateCompanyData();
		  
		  //error 05/02
		  //IDStock_UpdateCompanyPriceHistory();
		  
		  //done 05/02
		  //IDStock_UpdatePriceHistory();
		  
		  //done 05/01
		  //IDStock_UpdateERCalendar();
		  
		  //done 04/30
		  //IDStock_UpdateCompanies();
	  }
});