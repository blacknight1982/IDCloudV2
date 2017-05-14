/**
 * Created by John on 2/8/2016.
 */
var request = require('request');
var csv_stream = require('csv-stream');
var fs = require('fs');
var async = require('async');
var mysql = require('mysql');


var tickerArray = [];

var csvReadOptions = {
    delimiter: '\t', // default is ,
    endLine: '\n', // default is \n,
    columns: ['ticker', 'name'], // by default read the first line and use values found as columns
    //escapeChar : '"', // default is an empty string
    //enclosedChar: '"' // default is an empty string
}

var csvReadOptionsTicker = {
    delimiter: ',', // default is ,
    endLine: '\n', // default is \n,
    columns: ['date', 'open', 'high', 'low', 'close', 'volume', 'adjclose'] // by default read the first line and use values found as columns
}

var mySQLPool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'ljh123',
    database: 'idstock'
});

async.series({
        one: function (cblevel1) {
            var csvStream = csv_stream.createStream(csvReadOptions);
            fs.createReadStream('US_Tickers.csv').pipe(csvStream)
                .on('data', function (data) {
                    tickerArray.push(data);
                })
                .on('end', function () {
                    //tickerArray = tickerArray.slice(0, 1);
                    cblevel1();
                })
        },
        two: function (cblevel1) {

            async.eachSeries(tickerArray,
                function (aTicker, cblevel2) {
                    var csvStreamTicker = csv_stream.createStream(csvReadOptionsTicker);
                    var tickerUrl = 'http://ichart.yahoo.com/table.csv?s=' + aTicker.ticker;
                    var tickerDataArray = [];
                    request(tickerUrl).pipe(csvStreamTicker)
                        .on('data', function (oneDayData) {
                            if (oneDayData.date != 'Date' && oneDayData.volume != 0) {

                                var adjfactor = oneDayData.adjclose / oneDayData.close;
                                var tickerValue = {
                                    symbol: aTicker.ticker,
                                    date: oneDayData.date,
                                    open: oneDayData.open * adjfactor,
                                    high: oneDayData.high * adjfactor,
                                    low: oneDayData.low * adjfactor,
                                    close: oneDayData.adjclose,
                                    volume: oneDayData.volume,
                                    ma5: 0,
                                    ma10: 0,
                                    ma20: 0,
                                    ma60: 0
                                };
                                tickerDataArray.push(tickerValue);
                            }
                        })
                        .on('end', function () {
                            tickerDataArray.sort(compareByDate);

                            /*
                             * Calculate moving average for every day close price
                             */
                            for (var i = 0, len = tickerDataArray.length; i < len; i++) {
                                var ma5 = 0.0;
                                for (var j = 0; j < 5; j++) {
                                    if (i + j >= tickerDataArray.length) {
                                        ma5 = ma5 + parseFloat(tickerDataArray[tickerDataArray.length - 1].close);
                                    }
                                    else {
                                        ma5 = ma5 + parseFloat(tickerDataArray[i + j].close);
                                    }
                                }
                                ma5 = ma5 / 5;
                                tickerDataArray[i].ma5 = ma5.toFixed(3);
                                var ma10 = 0.0;
                                for (var j = 0; j < 10; j++) {
                                    if (i + j >= tickerDataArray.length) {
                                        ma10 = ma10 + parseFloat(tickerDataArray[tickerDataArray.length - 1].close);
                                    }
                                    else {
                                        ma10 = ma10 + parseFloat(tickerDataArray[i + j].close);
                                    }
                                }
                                ma10 = ma10 / 10;
                                tickerDataArray[i].ma10 = ma10.toFixed(3);
                                var ma20 = 0.0;
                                for (var j = 0; j < 20; j++) {
                                    if (i + j >= tickerDataArray.length) {
                                        ma20 = ma20 + parseFloat(tickerDataArray[tickerDataArray.length - 1].close);
                                    }
                                    else {
                                        ma20 = ma20 + parseFloat(tickerDataArray[i + j].close);
                                    }
                                }
                                ma20 = ma20 / 20;
                                tickerDataArray[i].ma20 = ma20.toFixed(3);
                                var ma60 = 0.0;
                                for (var j = 0; j < 60; j++) {
                                    if (i + j >= tickerDataArray.length) {
                                        ma60 = ma60 + parseFloat(tickerDataArray[tickerDataArray.length - 1].close);
                                    }
                                    else {
                                        ma60 = ma60 + parseFloat(tickerDataArray[i + j].close);
                                    }
                                }
                                ma60 = ma60 / 60;
                                tickerDataArray[i].ma60 = ma60.toFixed(3);

                            }

                            console.log(tickerDataArray);
                            mySQLPool.getConnection(function (err, conn) {
                                if (err) throw err;
                                var queryString = 'insert into company_basic (symbol,date,open,high,low,close,volume,ma5,ma10,ma20,ma60) values ';


                                for (var i = 0, len = tickerDataArray.length; i < len; i++) {
                                    queryString = queryString + "('" + tickerDataArray[i].symbol + "','" + tickerDataArray[i].date + "',"
                                        + tickerDataArray[i].open + "," + tickerDataArray[i].high + "," + tickerDataArray[i].low + ","
                                        + tickerDataArray[i].close + "," + tickerDataArray[i].volume + "," + tickerDataArray[i].ma5 + ","
                                        + tickerDataArray[i].ma10 + "," + tickerDataArray[i].ma20 + "," + tickerDataArray[i].ma60 + "),";
                                }

                                queryString = queryString.substr(0, queryString.length - 1);
                                console.log(queryString);

                                conn.query(queryString, tickerDataArray, function (error, results) {
                                    if (error) {
                                        console.log(error);
                                        cblevel2();
                                    }
                                    else {
                                        cblevel2();
                                    }
                                });
                                conn.release();
                            });
                        });
                },
                function (err) {
                    mySQLPool.end();
                    cblevel1();
                }
            );
        }
    },
    function (err, results) {
        console.log('all executed');

    });

function compareByDate(a, b) {
    if (a.date < b.date) {
        return 1;
    }
    if (a.date > b.date) {
        return -1;
    }
    return 0;
}



