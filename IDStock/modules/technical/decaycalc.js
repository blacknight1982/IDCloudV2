/**
 * decaycalc - calculate the XXX ETF decay
 * Author John Liu
 * 05/14/2016
 */
var async = require('async');
var logger = require('../logging/logger')(module);

/*
 * targetArray - take targetArray[i].date as date, take targetArray[i].price as price
 * subjectArray - take subjectArray[i].date as date, take subjectArray[i].price as price
 * correlation - the multiple of target to subject 
 * return decayResults = {
			targetStartDate,
			targetToDate,
			targetStartPrice,
			targetToPrice,
			subjectStartDate,
			subjectToDate,
			subjectStartPrice,
			subjectToPrice,
			subjectIncrease,
			targetIncrease,
			actualTargetIncrease,
			correlation,
			decay,
			tradingDays,
			reason
	}
 */
		
function decaycalc(targetArray, subjectArray, correlation){
	
	var targetStartDate = targetArray[0].date;
	var targetToDate = targetArray[targetArray.length-1].date;
	var subjectStartDate = subjectArray[0].date;
	var subjectToDate = subjectArray[subjectArray.length-1].date;
	var targetStartPrice = targetArray[0].price;
	var targetToPrice =  targetArray[targetArray.length-1].price;
	var subjectStartPrice = subjectArray[0].price;
	var subjectToPrice =  subjectArray[subjectArray.length-1].price;
	
	var decayResults = {
			targetStartDate:'',
			targetToDate:'',
			targetStartPrice:0,
			targetToPrice:0,
			subjectStartDate:'',
			subjectToDate:'',
			subjectStartPrice:0,
			subjectToPrice:0,
			subjectIncrease:'N/A',
			targetIncrease:'N/A',
			actualTargetIncrease:'N/A',
			correlation:0,
			decay:'N/A',
			tradingDays:0,
			reason:'Calculation failed'
	};
	
	decayResults.targetStartDate = targetStartDate;
	decayResults.targetToDate = targetToDate;
	decayResults.subjectStartDate = subjectStartDate;
	decayResults.subjectToDate = subjectToDate;
	decayResults.targetStartPrice = targetStartPrice;
	decayResults.targetToPrice = targetToPrice;
	decayResults.subjectStartPrice = subjectStartPrice;
	decayResults.subjectToPrice = subjectToPrice;
	decayResults.correlation = correlation;
	
	var subjectIncrease = parseFloat(subjectToPrice)/parseFloat(subjectStartPrice) - 1;
	var actualTargetIncrease = parseFloat(targetToPrice)/parseFloat(targetStartPrice) - 1;
	
	decayResults.subjectIncrease = subjectIncrease;
	decayResults.actualTargetIncrease = actualTargetIncrease;
	
	if((targetStartDate===subjectStartDate)&&(targetToDate===subjectToDate)){
		var tradingDays = targetArray.length-1;
		var subjectAverageIncrease = Math.pow((subjectIncrease + 1), 1/tradingDays) - 1;
		var targetAverageIncrease = subjectAverageIncrease*parseFloat(correlation);
		
		var targetIncreaseFactor = Math.pow((targetAverageIncrease + 1), tradingDays);
		var targetIncrease = targetIncreaseFactor - 1;
		
		var deserveValue = targetIncreaseFactor * parseFloat(targetStartPrice);
		var actualValue = parseFloat(targetToPrice);
		
		decayResults.subjectIncrease = subjectIncrease;
		decayResults.targetIncrease = targetIncrease;
		decayResults.tradingDays = tradingDays;
		
		if(targetIncrease > -1){
			decayResults.decay = 1-(actualValue/deserveValue);
			decayResults.reason = 'Calculation Successful!';
		}
		else{
			decayResults.reason = 'Subject depreciated too much! Cannot calculate decay.';
		}
	}
	else{
		decayResults.reason = 'Date range mis-match. Cannot calculate decay.';
	}
	
	return decayResults;
}

module.exports = decaycalc;