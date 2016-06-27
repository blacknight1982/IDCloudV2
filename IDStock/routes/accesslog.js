/**
 * Created by John Liu on 05/16/2016.
 */
var logger = require('../modules/logger')(module);
var async = require('async');
var db = require('../modules/db');



function accesslog(req, res,next){
	
	var queryString = "insert into accesslog (ip, user_agent, access_module) values ('"+req.ip+"','"+req.headers['user-agent']+"','"+
	req.url+"')";
	db.get().query(queryString, function (error, results) {
        if (error) {
            logger.log('error',error);
        }
        next();
    });
}

module.exports = accesslog;

