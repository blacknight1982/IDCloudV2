/**
 * Created by John on 2/6/2016.
 */
var request = require('request');
var csv_stream = require('csv-stream');
var fs = require('fs');
var async = require('async');

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

fs.createReadStream('PreparedCompanies_20160207.csv').pipe(csvStream)
    .on('data', function (data) {
        companyArray.push(data);
    })
    .on('end', function () {
        companyArray.sort(compareByMarketCap);

        async.each(companyArray,
            // 2nd param is the function that each item is passed to
            function (company, cb) {
                // Call an asynchronous function
                request('http://finance.yahoo.com/webservice/v1/symbols/' + company.symbol + '/quote?format=json',
                    function (error, response, body) {
                        if (!error && response.statusCode == 200) {
                            var jsonResult = JSON.parse(body);
                            var price = jsonResult.list.resources[0].resource.fields.price;
                            company.currentSharePrice = price;
                            console.log(company.symbol + ':' + price);
                        }
                        cb();
                    });
            },
            // 3rd param is the function to call when everything's done
            function (err) {
                // All tasks are done now
                console.log('All call finished');
                var fwstream = fs.createWriteStream('PreparedCompanies_20160207_UpdatedPrice.csv');
                companyArray.forEach(function (element, index) {
                    fwstream.write(element.symbol + '\t' + element.name + '\t' + element.lastSale + '\t' + element.marketCap + '\t' +
                        element.ipoyear + '\t' + element.sector + '\t' + element.industry + '\t' + element.summaryQuote + '\t' + element.currentSharePrice + '\n');
                });
                ;
            }
        );
    })

function compareBySymbol(a, b) {
    if (a.symbol < b.symbol) {
        return -1;
    }
    if (a.symbol > b.symbol) {
        return 1;
    }
    return 0;
}

function compareByMarketCap(a, b) {
    if (parseFloat(a.marketCap) < parseFloat(b.marketCap)) {
        return 1;
    }
    if (parseFloat(a.marketCap) > parseFloat(b.marketCap)) {
        return -1;
    }
    return 0;
}
