/**
 * Created by John Liu on 2/7/2016.
 */
var request = require('request');
var csv_stream = require('csv-stream');
var fs = require('fs');
var async = require("async");

var companyArray = [];

// All of these arguments are optional.
var csvReadOptions = {
    delimiter: '\t', // default is ,
    endLine: '\n', // default is \n,
    columns: ['symbol', 'name', 'lastSale', 'marketCap', 'ipoyear', 'sector', 'industry', 'summaryQuote', 'currentSharePrice', 'erDate'], // by default read the first line and use values found as columns
    //escapeChar : '"', // default is an empty string
    //enclosedChar: '"' // default is an empty string
}

var csvStream = csv_stream.createStream(csvReadOptions);

fs.createReadStream('PreparedCompanies_20160207_UpdatedPrice.csv').pipe(csvStream)
    .on('data', function (data) {
        companyArray.push(data);
    })
    .on('end', function () {

        async.each(companyArray,
            // 2nd param is the function that each item is passed to
            function (company, cb) {
                // Call an asynchronous function
                var url = 'http://biz.yahoo.com/research/earncal/' + company.symbol[0] + '/' + company.symbol + '.html';
                console.log(url);
                request(url,
                    function (error, response, body) {
                        if (!error && response.statusCode == 200) {
                            var indexOfERDate = body.indexOf('Earnings Calendar for');
                            var tempString = body.substr(indexOfERDate+22, 22);
                            var indexOfCloseSymble = tempString.indexOf('<');
                            var tempString2 = tempString.substr(0,indexOfCloseSymble);
                            var d = new Date(tempString2);
                            var shortString = d.toLocaleDateString();
                            company.erDate = shortString;
                        }
                        cb();
                    });
            },
            // 3rd param is the function to call when everything's done
            function (err) {
                // All tasks are done now
                console.log(companyArray);
                console.log('All call finished');
                var fwstream = fs.createWriteStream('PreparedCompanies_20160207_UpdatedPrice_UpdatedERCal.csv');
                companyArray.forEach(function (element, index) {
                    fwstream.write(element.symbol + '\t' + element.name + '\t' + element.lastSale + '\t' +
                        element.marketCap + '\t' + element.ipoyear + '\t' + element.sector + '\t' +
                        element.industry + '\t' + element.summaryQuote + '\t' + element.currentSharePrice +
                        '\t'+element.erDate+'\n');
                });
                ;
            }
        );
    })