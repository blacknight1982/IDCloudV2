/**
 * yqlcompanydataquery - Query company from 
 * http://query.yahooapis.com/v1/public/yql?q=select * from yahoo.finance.quotes where symbol in 
 * ("YHOO","AAPL","GOOG","MSFT","UGAZ","NUGT")&env=http://datatables.org/alltables.env
 * Author John Liu
 * Created 08/14/2016
 */

var request = require('request');
var logger = require('../modules/logger')(module);
var async = require('async');
var xml2js = require('xml2js');

/*
 * Input: symbolObjectArray which has stock symbol in symbolObjectArray[i].symbol
 * Output and callback:
 * callback will take the symbolObjectArray as input  
 * symbolResultArray[i].symbol as stock symbol, 
 * symbolResultArray[i].price as stock price
 */
var symbolResultArray = [];
function query(symbolObjectArray, callback){
	
	symbolResultArray = [];
	var urls = [];
	
	for(var i=0;i<Math.floor(symbolObjectArray.length/200)+1;i++){
		var url = 'http://query.yahooapis.com/v1/public/yql?q=select * from yahoo.finance.quotes where symbol in (';
		var remainElement = i===Math.floor(symbolObjectArray.length/200) ? (symbolObjectArray.length%200):200;
		for (var j=200*i;j<200*i+remainElement;j++){
			url = url + '"' + symbolObjectArray[j].symbol +'",';
		}
		url=url.substr(0, url.length - 1);
		url=url+')&env=http://datatables.org/alltables.env';
		//url= encodeURIComponent(url);
		urls.push(url);
	}
	
	logger.log('info',urls);
	
	async.eachSeries(urls,function(eachUrl,cbEachURL){
		request.get(eachUrl, {timeout: 60000},
	            function (error, response, body) {
					logger.log('info','requesting ' + url + ' finished');
					xml2js.parseString(body,function(err,result){
						var quotes = result.query.results[0].quote;
						logger.log("info",quotes.length);
						for (var i=0;i<quotes.length;i++){
							var oneSymbol = {
								symbol:quotes[i].$.symbol,
								averageDailyVolume:quotes[i].AverageDailyVolume[0],
								bookValue:quotes[i].BookValue[0],	
								changePercentChange:quotes[i].Change_PercentChange[0],
								change:quotes[i].Change[0],
								dividendShare:quotes[i].DividendShare[0],
								lastTradeDate:quotes[i].LastTradeDate[0],
								earningsShare:quotes[i].EarningsShare[0],
								epsEstimateCurrentYear:quotes[i].EPSEstimateCurrentYear[0],
								epsEstimateNextYear:quotes[i].EPSEstimateNextYear[0],
								daysLow:quotes[i].DaysLow[0],
								daysHigh:quotes[i].DaysHigh[0],
								yearLow:quotes[i].YearLow[0],
								yearHigh:quotes[i].YearHigh[0],
								marketCapitalization:quotes[i].MarketCapitalization[0],
								ebitda:quotes[i].EBITDA[0],
								changeFromYearLow:quotes[i].ChangeFromYearLow[0],
								changeFromYearHigh:quotes[i].ChangeFromYearHigh[0],
								percebtChangeFromYearHigh:quotes[i].PercebtChangeFromYearHigh[0],
								lastTradePriceOnly:quotes[i].LastTradePriceOnly[0],
								fiftydayMovingAverage:quotes[i].FiftydayMovingAverage[0],
								twoHundreddayMovingAverage:quotes[i].TwoHundreddayMovingAverage[0],
								changeFromTwoHundreddayMovingAverage:quotes[i].ChangeFromTwoHundreddayMovingAverage[0],
								percentChangeFromTwoHundreddayMovingAverage:quotes[i].PercentChangeFromTwoHundreddayMovingAverage[0],
								changeFromFiftydayMovingAverage:quotes[i].ChangeFromFiftydayMovingAverage[0],
								percentChangeFromFiftydayMovingAverage:quotes[i].PercentChangeFromFiftydayMovingAverage[0],
								name:quotes[i].Name[0],
								open:quotes[i].Open[0],
								previousClose:quotes[i].PreviousClose[0],
								changeinPercent:quotes[i].ChangeinPercent[0],
								priceSales:quotes[i].PriceSales[0],
								priceBook:quotes[i].PriceBook[0],
								exDividendDate:quotes[i].ExDividendDate[0],
								dividendPayDate:quotes[i].DividendPayDate[0],
								pegRatio:quotes[i].PERatio[0],
								priceEPSEstimateCurrentYear:quotes[i].PriceEPSEstimateCurrentYear[0],
								priceEPSEstimateNextYear:quotes[i].PriceEPSEstimateNextYear[0],
								symbol:quotes[i].Symbol[0],
								shortRatio:quotes[i].ShortRatio[0],
								oneyrTargetPrice:quotes[i].OneyrTargetPrice[0],
								volume:quotes[i].Volume[0],
								yearRange:quotes[i].YearRange[0],
								stockExchange:quotes[i].StockExchange[0],
								dividendYield:quotes[i].DividendYield[0],
								percentChange:quotes[i].PercentChange[0]
							};
							symbolResultArray.push(oneSymbol);
						}
						cbEachURL();
					});
            });
	},
	function (err) {
		logger.log('info','yqlcompanydataquery callback triggered');
		callback(symbolResultArray);
	});
}

module.exports = query;

