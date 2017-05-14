/**
 * Created by John on 2/6/2016.
 */
var request = require('request');
var csv_stream = require('csv-stream');
var async = require('async');
//var fs = require('fs');
var mysql = require('mysql');
var logger = require('../logger/logger');

// All of these arguments are optional.
var csvReadOptions = {
    delimiter: ',', // default is ,
    endLine: '\n', // default is \n,
    columns: ['symbol', 'name', 'lastSale', 'marketCap', 'ipoyear', 'sector', 'industry', 'summaryQuote'], // by default read the first line and use values found as columns
    //escapeChar : '"', // default is an empty string
    enclosedChar: '"' // default is an empty string
}

var companyArray = [];

//var fstream = fs.createWriteStream('US_Tickers.csv');
var requestURLs = ['http://www.nasdaq.com/screening/companies-by-name.aspx?letter=0&exchange=nasdaq&render=download',
    'http://www.nasdaq.com/screening/companies-by-name.aspx?letter=0&exchange=nyse&render=download',
    'http://www.nasdaq.com/screening/companies-by-name.aspx?letter=0&exchange=amex&render=download'];

var mySQLPool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'ljh123',
    database: 'idstock'
});

logger.log('info','log to file');

async.each(requestURLs,
    function (requestURL, cb) {
        var csvStream = csv_stream.createStream(csvReadOptions);
        request(requestURL).pipe(csvStream)
            .on('error', function (err) {
            	logger.log('error',err);
            })
            .on('data', function (data) {
                companyArray.push(data);
            })
            .on('end', function () {
                logger.log('info',requestURL);
                cb();
            })
    },
    function (err) {
        logger.log('info','Total company number before market cap filter: %d',companyArray.length);

        async.series({
        	/*
        	 * Step1 clear the DB
        	 */
            step1: function(cblevel2){
                mySQLPool.getConnection(function (err, conn) {
                    if (err) throw err;
                    var queryString = "delete from company_basic";
                    conn.query(queryString, function (error, results) {
                        if (error) {
                            logger.log('error',error);
                        }
                        else {
                        }
                        cblevel2();
                    });
                    conn.release();
                });
            },
                    
            /*
             * Step2: update the DB
             */
            step2: function(cblevel2){
                outPutFilteredDataToDB(cblevel2);
            }
        },function (err, results) {
            logger.log('info','cb level2 all executed');
            mySQLPool.end();
        });
    }
);

function outPutFilteredDataToDB(cblevel2) {
    var queryString = "insert into company_basic (symbol, name, market_cap, ipoyear, sector, industry) values ";
    for (var i = 0, len = companyArray.length; i < len; i++) {
        var makcap = companyArray[i].marketCap;
        var lastChar = makcap.substr(makcap.length - 1);
        if (lastChar == 'B' && makcap.charAt(0) == '$') {
            var makcapval = makcap.substr(1, makcap.length - 2);
            logger.log('info',companyArray[i].symbol);
            queryString = queryString + "('" + companyArray[i].symbol + "','" + companyArray[i].name + "'," + makcapval * 1000 + ",'" +
                companyArray[i].ipoyear + "','" + companyArray[i].sector + "','" + companyArray[i].industry + "'),";

        }
        else if (lastChar == 'M' && makcap.charAt(0) == '$') {
            var makcapval = makcap.substr(1, makcap.length - 2);
            if (makcapval >= 100) {
            	logger.log('info',companyArray[i].symbol);
                queryString = queryString + "('" + companyArray[i].symbol + "','" + companyArray[i].name + "'," + makcapval + ",'" +
                    companyArray[i].ipoyear + "','" + companyArray[i].sector + "','" + companyArray[i].industry + "'),";
            }
        }
    }
    queryString = queryString.substr(0, queryString.length - 1);
    logger.log('info','Query String is : %s',queryString);

    mySQLPool.getConnection(function (err, conn) {
        if (err) throw err;
        conn.query(queryString, function (error, results) {
            if (error) {
                logger.log('error',error);
            }
            else {

            }
            cblevel2();
        });
        conn.release();
    });
}
