/**
 * Author John Liu
 */

var winston = require('winston');
var path = require('path');

module.exports = function(callingModule) {
	return new winston.Logger({
		transports: [
		             new winston.transports.Console({json: false, timestamp: true, label: getLabel(callingModule)}),
	                 new winston.transports.File({ filename: getLoggingDir() + '/debug.log', json: false, label: getLabel(callingModule)})
	                 ],
	    exceptionHandlers: [
	                 new (winston.transports.Console)({ json: false, timestamp: true }),
	                 new winston.transports.File({ filename: getLoggingDir() + '/exceptions.log', json: false })
	                 ],
	    exitOnError: false
	  });
	};
	

function getLabel(callingModule) {
	return callingModule.filename;
}

function getLoggingDir(){
	return __dirname+'/../../log';
	
}
