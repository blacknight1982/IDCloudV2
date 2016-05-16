/**
 * Created by John Liu on 05/16/2016.
 */
var mysql = require('mysql');
var logger = require('../modules/logger')(module);
var async = require('async');

var mySQLPool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'ljh123',
    database: 'idstock'
});



function accesslog(req, res,next){
	
	var queryString = "insert into accesslog (ip, user_agent, access_module) values ('"+req.ip+"','"+req.headers['user-agent']+"','"+
	req.url+"')";
	
	mySQLPool.getConnection(function (err, conn) {
        if (err){
        	throw err;
        }
        conn.query(queryString, function (error, results) {
            if (error) {
                logger.log('error',error);
            }
        });
        conn.release();
        next();
    });
}

module.exports = accesslog;

