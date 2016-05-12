/**
 * Created by I048929 on 2/16/2016.
 */

var express = require('express');
var router = express();
var mysql = require('mysql');



/* GET home page. */
router.get('/', function (req, res, next) {
    var yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterdayString = yesterday.toLocaleDateString().slice(0,10);

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
    var queryString = 'SELECT symbol,name,market_cap,sector, industry, magather_date, magather_price, ma5, ma10, ma20, ma60, ma200 FROM company_latest_magather';


    connection.query(queryString, function(err, rows, fields) {
        if (err) throw err;

        for (var i in rows) {
            rows[i].magather_date = rows[i].magather_date.toLocaleString().slice(0,10);
        }

        res.render('indicator', {title: 'Earning Calendar',companyList: rows,yesterday:yesterdayString});
    });
    connection.end();
});

function yesterday(){

    return date;
}

module.exports = router;