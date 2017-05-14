/**
 * Created by John on 2/20/2016.
 */

var express = require('express');
var router = express();
var mysql = require('mysql');



/* GET home page. */
router.get('/', function (req, res, next) {
    var yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterdayString = yesterday.toISOString().slice(0,10);

    console.log(yesterdayString);

    var connection = mysql.createConnection(
        {
            host     : 'localhost',
            user     : 'root',
            password : 'ljh123',
            database : 'idstock',
        }
    );
    connection.connect();
    var queryString = 'SELECT symbol,name,assets, avg_vol, magather_date, magather_price, ma5, ma10, ma20, ma60 FROM etf_latest_magather';


    connection.query(queryString, function(err, rows, fields) {
        if (err) throw err;

        for (var i in rows) {
            rows[i].magather_date = rows[i].magather_date.toISOString().slice(0,10);
        }

        res.render('etfindicator', {title: 'ETF Indicator',etfList: rows,yesterday:yesterdayString});
    });
    connection.end();
});

function yesterday(){

    return date;
}

module.exports = router;