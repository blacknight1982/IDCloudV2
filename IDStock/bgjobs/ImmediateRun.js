/**
 * Created by John Liu on 05/08/2016.
 */


var IDStock_UpdateStockPrice = require('./IDStock_UpdateStockPrice');
var IDStock_UpdatePriceHistory = require('./IDStock_UpdatePriceHistory');
var IDStock_UpdateERCalendar = require('./IDStock_UpdateERCalendar');
var db = require('../modules/db');

//IDStock_UpdateStockPrice();

db.connect(db.MODE_PRODUCTION, function(err) {
	  if (err) {
	    console.log('Unable to connect to MySQL.');
	    process.exit(1);
	  } else {
		  IDStock_UpdateStockPrice();
		  //IDStock_UpdatePriceHistory();
		  //IDStock_UpdateERCalendar();
	  }
	});