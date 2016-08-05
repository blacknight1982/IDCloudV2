/**
 * Created by John Liu on 2/16/2016.
 */

var express = require('express');
var logger = require('../modules/logger')(module);
var router = express();
var db = require('../modules/db');

router.get('/', function (req, res, next) {
        res.render('ercal_ehp', {title: 'IDCloud Trading Tool'});
});

router.get('/:date', function (req, res, next) {
	
	var dateString = req.params.date;
	var nextDate = new Date(dateString);
	nextDate.setDate(nextDate.getDate() + 2);
	var nextDateString = nextDate.toLocaleDateString().slice(0,10);
	logger.log('info',dateString);
	logger.log('info',nextDateString);
	
    var queryString = "SELECT symbol,name,market_cap,ipoyear,sector,industry,erdate,erdetails,price,pe,eps FROM company_tickers_ercal where (erdate = '" + dateString + "' and erdetails like '%after%') or (erdate = '" + nextDateString + "' and erdetails like '%before%')";
    logger.log('info',queryString);
    
    db.get().query(queryString, function(err, rows, fields) {
        if (err) throw err;

        for (var i in rows) {
            rows[i].erdate = rows[i].erdate.toLocaleString().slice(0,10);
            rows[i].market_cap = Math.floor(rows[i].market_cap);
        }
        var response = {er_companies:rows};
        res.json(response);
    });
});

module.exports = router;
