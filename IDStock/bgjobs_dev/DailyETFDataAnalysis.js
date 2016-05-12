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

var analysisParam = {
    /*
     * Parameter for trend trading
     */
    ma20HigherPercent: 95,
    ma20CalculateDays: 50,
    /*
     * Parameter for ma gather and direction
     */
    maGatherPercent: 3,
    maGatherAttentionPeriod: 250,

    /*
     * Parameter for up breakout
     */
    comparePriceEarlierDate: 120
}

var mySQLPool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'ljh123',
    database: 'idstock'
});

async.series({

        /**
         * Clear database for analysis_breakout first
         * @param cblevel1
         */
        zero1: function (cblevel1) {
            mySQLPool.getConnection(function (err, conn) {
                if (err) throw err;
                var queryString = "delete from analysis_etf_breakout";
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

        /**
         * Clear database for analysis_magather first
         * @param cblevel1
         */
        zero2: function (cblevel1) {
            mySQLPool.getConnection(function (err, conn) {
                if (err) throw err;
                var queryString = "delete from analysis_etf_magather";
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

        /**
         * Read all company basic data into Array
         * @param cblevel1
         */
        one: function (cblevel1) {
            var csvStream = csv_stream.createStream(csvReadOptions);
            fs.createReadStream('US_ETF_Selected.csv').pipe(csvStream)
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
                    console.log("Processing: " + tickerUrl);
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
                                    ma60: 0,
                                    ma200: 0
                                };
                                tickerDataArray.push(tickerValue);
                            }
                        })
                        .on('end', function () {
                            tickerDataArray.sort(compareByDate);

                            // Prepare previous high value for breakout analysis
                            var previoushigh = 0;
                            var previoushigh_date = new Date().toLocaleDateString();

                            var breakoutindicator = {
                                previoushigh: 0,
                                previoushigh_date: new Date().toLocaleDateString()
                            }

                            // Prepare array for MA gather pattern
                            var magatherarray = [];

                            calculateMovingAveragesAndBreakout(tickerDataArray, magatherarray, breakoutindicator);
                            console.log(magatherarray);

                            async.series({
                                    one: function (cblevel3) {
                                        mySQLPool.getConnection(function (err, conn) {
                                            if (err) throw err;

                                            //Prepare query string for inserting data for breakout analysis
                                            var queryString = "insert into analysis_etf_breakout (symbol, highprice, highprice_date) values ('" +
                                                aTicker.ticker + "'," + previoushigh + ",'" + previoushigh_date + "')";

                                            conn.query(queryString, function (error, results) {
                                                if (error) {
                                                    console.log(error);
                                                }
                                                else {
                                                }
                                                cblevel3();
                                            });
                                            conn.release();
                                        });
                                    },
                                    two: function (cblevel3) {
                                        if (magatherarray.length > 0) {
                                            mySQLPool.getConnection(function (err, conn) {
                                                if (err) throw err;

                                                //Prepare query string for inserting data for ma gather analysis
                                                var queryString = "insert into analysis_etf_magather (symbol, magather_date, magather_price, ma5, ma10, ma20, ma60, ma200) values ";
                                                for (var i = 0, len = magatherarray.length; i < len; i++) {
                                                    queryString = queryString + "('" + magatherarray[i].symbol + "','" + magatherarray[i].magather_date + "'," +
                                                        magatherarray[i].magather_price + "," + magatherarray[i].ma5 + "," + magatherarray[i].ma10 + "," +
                                                        magatherarray[i].ma20 + "," + magatherarray[i].ma60 + "," + magatherarray[i].ma200 + "),";
                                                }
                                                queryString = queryString.substr(0, queryString.length - 1);
                                                console.log(queryString);
                                                conn.query(queryString, function (error, results) {
                                                    if (error) {
                                                        console.log(error);
                                                    }
                                                    else {
                                                    }
                                                    cblevel3();
                                                });
                                                conn.release();
                                            });
                                        }
                                        else {
                                            cblevel3();
                                        }
                                    }
                                },
                                function (err, results) {
                                    cblevel2();
                                    console.log('cb level3 all executed');
                                });
                        });
                },
                function (err) {
                    mySQLPool.end();
                    cblevel1();
                    console.log('cb level2 all executed');
                }
            );
        }
    },
    function (err, results) {
        console.log('all executed');
    }
)
;

function compareByDate(a, b) {
    if (a.date < b.date) {
        return 1;
    }
    if (a.date > b.date) {
        return -1;
    }
    return 0;
}

function calculateMovingAveragesAndBreakout(tickerDataArray, magatherarray, breakoutindicator) {
    for (var i = 0, len = tickerDataArray.length; i < len; i++) {
        var ma5 = 0.0;
        var ma10 = 0.0;
        var ma20 = 0.0;
        var ma60 = 0.0;
        var ma200 = 0.0;

        if (i == 0) {
            for (var j = 0; j < 5; j++) {
                if (i + j >= tickerDataArray.length) {
                    ma5 = ma5 + parseFloat(tickerDataArray[tickerDataArray.length - 1].close);
                }
                else {
                    ma5 = ma5 + parseFloat(tickerDataArray[i + j].close);
                }
            }
            ma5 = ma5 / 5;

            for (var j = 0; j < 10; j++) {
                if (i + j >= tickerDataArray.length) {
                    ma10 = ma10 + parseFloat(tickerDataArray[tickerDataArray.length - 1].close);
                }
                else {
                    ma10 = ma10 + parseFloat(tickerDataArray[i + j].close);
                }
            }
            ma10 = ma10 / 10;

            for (var j = 0; j < 20; j++) {
                if (i + j >= tickerDataArray.length) {
                    ma20 = ma20 + parseFloat(tickerDataArray[tickerDataArray.length - 1].close);
                }
                else {
                    ma20 = ma20 + parseFloat(tickerDataArray[i + j].close);
                }
            }
            ma20 = ma20 / 20;

            for (var j = 0; j < 60; j++) {
                if (i + j >= tickerDataArray.length) {
                    ma60 = ma60 + parseFloat(tickerDataArray[tickerDataArray.length - 1].close);
                }
                else {
                    ma60 = ma60 + parseFloat(tickerDataArray[i + j].close);
                }
            }
            ma60 = ma60 / 60;

            for (var j = 0; j < 200; j++) {
                if (i + j >= tickerDataArray.length) {
                    ma200 = ma200 + parseFloat(tickerDataArray[tickerDataArray.length - 1].close);
                }
                else {
                    ma200 = ma200 + parseFloat(tickerDataArray[i + j].close);
                }
            }
            ma200 = ma200 / 200;
        }
        if (i > 0) {
            console.log(i);
            if ((i + 4) >= tickerDataArray.length) {
                ma5 = (parseFloat(tickerDataArray[i - 1].ma5 * 5) - parseFloat(tickerDataArray[i - 1].close) + parseFloat(tickerDataArray[tickerDataArray.length - 1].close)) / 5;

            }
            else {
                ma5 = (parseFloat(tickerDataArray[i - 1].ma5 * 5) - parseFloat(tickerDataArray[i - 1].close) + parseFloat(tickerDataArray[i + 4].close)) / 5;
            }
            if ((i + 9) >= tickerDataArray.length) {
                ma10 = (parseFloat(tickerDataArray[i - 1].ma10 * 10) - parseFloat(tickerDataArray[i - 1].close) + parseFloat(tickerDataArray[tickerDataArray.length - 1].close)) / 10;
            }
            else {
                ma10 = (parseFloat(tickerDataArray[i - 1].ma10 * 10) - parseFloat(tickerDataArray[i - 1].close) + parseFloat(tickerDataArray[i + 9].close)) / 10;
            }
            if ((i + 19) >= tickerDataArray.length) {
                ma20 = (parseFloat(tickerDataArray[i - 1].ma20 * 20) - parseFloat(tickerDataArray[i - 1].close) + parseFloat(tickerDataArray[tickerDataArray.length - 1].close)) / 20;
            }
            else {
                ma20 = (parseFloat(tickerDataArray[i - 1].ma20 * 20) - parseFloat(tickerDataArray[i - 1].close) + parseFloat(tickerDataArray[i + 19].close)) / 20;
            }
            if ((i + 59) >= tickerDataArray.length) {
                ma60 = (parseFloat(tickerDataArray[i - 1].ma60 * 60) - parseFloat(tickerDataArray[i - 1].close) + parseFloat(tickerDataArray[tickerDataArray.length - 1].close)) / 60;
            }
            else {
                ma60 = (parseFloat(tickerDataArray[i - 1].ma60 * 60) - parseFloat(tickerDataArray[i - 1].close) + parseFloat(tickerDataArray[i + 59].close)) / 60;
            }
            if ((i + 199) >= tickerDataArray.length) {
                ma200 = (parseFloat(tickerDataArray[i - 1].ma200 * 200) - parseFloat(tickerDataArray[i - 1].close) + parseFloat(tickerDataArray[tickerDataArray.length - 1].close)) / 200;
            }
            else {
                ma200 = (parseFloat(tickerDataArray[i - 1].ma200 * 200) - parseFloat(tickerDataArray[i - 1].close) + parseFloat(tickerDataArray[i + 199].close)) / 200;
            }
        }

        tickerDataArray[i].ma5 = ma5.toFixed(4);
        tickerDataArray[i].ma10 = ma10.toFixed(4);
        tickerDataArray[i].ma20 = ma20.toFixed(4);
        tickerDataArray[i].ma60 = ma60.toFixed(4);
        tickerDataArray[i].ma200 = ma200.toFixed(4);
        console.log(tickerDataArray[i]);

        /*
         * Calculate MA gather pattern
         */
        if (i < analysisParam.maGatherAttentionPeriod) {
            var maxMA = Math.max(tickerDataArray[i].ma5, tickerDataArray[i].ma10, tickerDataArray[i].ma20);
            var minMA = Math.min(tickerDataArray[i].ma5, tickerDataArray[i].ma10, tickerDataArray[i].ma20);
            if (((maxMA / minMA) - 1) * 100 < analysisParam.maGatherPercent) {

                magatherarray.push({
                    symbol: tickerDataArray[i].symbol,
                    magather_date: tickerDataArray[i].date,
                    magather_price: tickerDataArray[i].close,
                    ma5: tickerDataArray[i].ma5,
                    ma10: tickerDataArray[i].ma10,
                    ma20: tickerDataArray[i].ma20,
                    ma60: tickerDataArray[i].ma60,
                    ma200: tickerDataArray[i].ma200
                });
            }
        }

        /*
         * Calculate previous high price based on analysis parameter
         */

        if (i >= analysisParam.comparePriceEarlierDate && tickerDataArray[i].close > breakoutindicator.previoushigh) {
            breakoutindicator.previoushigh = tickerDataArray[i].close;
            breakoutindicator.previoushigh_date = tickerDataArray[i].date;
        }
    }
}