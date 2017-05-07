/**
 * Created by John Liu on 2/16/2016.
 */

var express = require('express');
var logger = require('../modules/logging/logger')(module);
var router = express();
var db = require('../modules/persistence/db');

router.get('/', function (req, res, next) {
        res.render('ercal', {title: 'IDCloud Trading Tool'});
});

router.get('/:date', function (req, res, next) {
    //var queryString = "SELECT symbol,name,market_cap,ipoyear,sector,industry,erdate,erdetails,price,pe,eps,industry_return,z_val,sample_count FROM company_tickers_ercal where erdate = '" + req.params.date + "'"
	var queryString = "SELECT symbol,name,market_cap,ipoyear,sector,industry,erdate,erdetails,price,pe,eps FROM company_tickers_ercal where erdate = '" + req.params.date + "'"
    
	logger.log('info',queryString);
    
    db.get().query(queryString, function(err, rows, fields) {
        if (err) throw err;

        for (var i in rows) {
            rows[i].erdate = rows[i].erdate.toISOString().slice(0,10);
            rows[i].market_cap = Math.floor(rows[i].market_cap);
        }
        var response = {er_companies:rows};
        res.json(response);
    });
});

module.exports = router;
