/**
 * Created by John Liu on 2/16/2016.
 */

var express = require('express');
var logger = require('../modules/logger')(module);
var router = express();
var db = require('../modules/db');

/* GET home page. */
router.get('/', function (req, res, next) {
    var queryString = "SELECT symbol,name,market_cap,ipoyear,sector,industry,erdate,erdetails,price,pe,eps FROM company_tickers_ercal where erdate <> '0000-00-00'"
	
    
    db.get().query(queryString, function(err, rows, fields) {
        if (err) throw err;

        for (var i in rows) {
            rows[i].erdate = rows[i].erdate.toLocaleString().slice(0,10);
            rows[i].market_cap = Math.floor(rows[i].market_cap);
        }
        logger.log('info',rows);
        res.render('ercal', {title: 'IDCloud Trading Tool',companyList: rows});
    });
});

module.exports = router;
