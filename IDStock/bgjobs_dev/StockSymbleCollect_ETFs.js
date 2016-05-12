/**
 * Created by John on 2/6/2016.
 */
//var request = require('request');
var csv_stream = require('csv-stream');
var async = require('async');
var fs = require('fs');
var mysql = require('mysql');

// All of these arguments are optional.
var csvReadOptions = {
    delimiter: '\t', // default is ,
    endLine: '\n', // default is \n,
    columns: ['symbol', 'name', 'price', 'assets', 'avgVol'], // by default read the first line and use values found as columns
}

var etfArray = [];

var mySQLPool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'ljh123',
    database: 'idstock'
});

var csvStream = csv_stream.createStream(csvReadOptions);
fs.createReadStream('US_ETF_Selected.csv').pipe(csvStream)
    .on('error', function (err) {
        console.log(err);
    })
    .on('data', function (data) {
        etfArray.push(data);
    })
    .on('end', function () {
        async.series({
            step1: function (cblevel1) {
                mySQLPool.getConnection(function (err, conn) {
                    if (err) throw err;
                    var queryString = "delete from etf_tickers";
                    conn.query(queryString, function (error, results) {
                        if (error) {
                            console.log(error);
                        }
                        else {
                        }
                        cblevel1();
                    });
                    conn.release();
                });
            },
            step2: function (cblevel1) {
                outPutFilteredDataToDB(cblevel1);
            }
        }, function (err, results) {
            console.log('cb level all executed');
            mySQLPool.end();
        });
    })

function outPutFilteredDataToDB(cblevel1) {
    var queryString = "insert into etf_tickers (symbol, name, assets, avg_vol) values ";
    for (var i = 0, len = etfArray.length; i < len; i++) {
        queryString = queryString + "('" + etfArray[i].symbol + "','" + etfArray[i].name + "','" + etfArray[i].assets + "','" +
            etfArray[i].avgVol + "'),";
    }
    queryString = queryString.substr(0, queryString.length - 1);
    console.log(queryString);

    mySQLPool.getConnection(function (err, conn) {
        if (err) throw err;
        conn.query(queryString, function (error, results) {
            if (error) {
                console.log(error);
            }
            else {

            }
            cblevel1();
        });
        conn.release();
    });
}
