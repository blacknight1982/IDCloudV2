/**
 * Created by John Liu on 8/14/2016.
 */

var express = require('express');
var logger = require('../modules/logger')(module);
var router = express();
var db = require('../modules/db');
var IDStock_UpdateCustomCompany = require('../modules/IDStock_UpdateCustomCompany');

router.get('/', function (req, res, next) {
        res.render('custom', {title: 'IDCloud Trading Tool'});
});

router.get('/all', function (req, res, next) {
    var queryString = "SELECT symbol,name,market_cap,ipoyear,sector,industry,erdate,erdetails,price,pe,eps FROM company_tickers_ercal where custom = 1"
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

router.post('/:customSymbol', function (req, res, next) {
	var customSymbol = req.params.customSymbol;
	IDStock_UpdateCustomCompany(customSymbol,function(object){
		logger.log('info',object);
		res.json(object);
		logger.log('info',customSymbol+ ' Added');
	});
});

module.exports = router;
