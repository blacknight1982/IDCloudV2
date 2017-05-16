/**
 * Created by John Liu on 2/16/2016.
 */
var async = require("async");
var express = require('express');
var logger = require('../modules/logging/logger')(module);
var router = express();
var db = require('../modules/persistence/db');
var HashTable = require('hashtable');

router.get('/', function (req, res, next) {
        res.render('ercal_ehp', {title: 'IDCloud Trading Tool'});
});

router.get('/:date', function (req, res, next) {
	
	var dateString = req.params.date;
	var nextDate = new Date(dateString);
	nextDate.setDate(nextDate.getDate() + 1);
	var nextDateString = nextDate.toISOString().slice(0,10);
	logger.log('info',dateString);
	logger.log('info',nextDateString);
	var hashtable = new HashTable();
	var response = {};
	var resultRows;
	
	async.series({
    	/*
		 * Step 1 execute query for industry stat
		 */
	    step1: function(cbGlobal){
	        
	    	var queryString_industry_stat = "select distinct cbeh.industry AS industry,round(avg(cbeh.percent_twoday),2) AS average_return,   round((avg(cbeh.percent_twoday) / std(cbeh.percent_twoday)),2) AS z_value,count(cbeh.industry) AS sample_count ,   median.median_val    from company_basic_ercal_history cbeh ,   (SELECT sq.industry, avg(sq.percent_twoday) as median_val FROM ( SELECT t1.row_number, t1.percent_twoday, t1.industry FROM( SELECT IF(@prev!=cbeh.industry, @rownum:=1, @rownum:=@rownum+1) as `row_number`, cbeh.percent_twoday, @prev:=cbeh.industry AS industry FROM (select * from company_basic_ercal_history order by industry) cbeh, (SELECT @rownum:=0, @prev:=NULL) r where (cbeh.rdate >= (now() - interval 4 month)) ORDER BY industry, percent_twoday ) as t1 INNER JOIN   (   SELECT count(*) as total_rows, industry    FROM company_basic_ercal_history cbeh   where (cbeh.rdate >= (now() - interval 4 month))   GROUP BY industry ) as t2 ON t1.industry = t2.industry WHERE 1=1 AND t1.row_number>=t2.total_rows/2 and t1.row_number<=t2.total_rows/2+1 )sq group by sq.industry) median    where   median.industry=cbeh.industry  and (cbeh.rdate >= (now() - interval 4 month)) group by cbeh.industry;";
	    	logger.log('info',queryString_industry_stat);	
	    	db.get().query(queryString_industry_stat, function(err, rows, fields) {
	            if (err) throw err;

	            for (var i in rows) {
	            	hashtable.put(rows[i].industry, rows[i].median_val);
	                	            }
	            logger.log('info',rows);   
	            cbGlobal();
	        });
	    },
	    
	    /*
	     * Step2: Read ER cal and assign industry stat
	     */
	    step2: function(cbGlobal){
	    	var queryString = "SELECT symbol,name,market_cap,ipoyear,sector,industry,erdate,erdetails,price,pe,eps,industry_return,z_val,sample_count FROM company_basic_ercal where ((erdate = '" + dateString + "' and erdetails like '%after%') or (erdate = '" + nextDateString + "' and erdetails like '%before%')) and industry_return>=1.5";
	        logger.log('info',queryString);	
	    	
	    	db.get().query(queryString, function(err, rows, fields) {
	            if (err) throw err;

	            for (var i in rows) {
	                rows[i].erdate = rows[i].erdate.toISOString().slice(0,10);
	                rows[i].market_cap = Math.floor(rows[i].market_cap);
	                rows[i].median = hashtable.get(rows[i].industry);
	            }
	            resultRows = rows;
	            cbGlobal();
	        });
	    	
	    }
    }, function (err, results) {
	    logger.log('info','cb level2 all executed');
	    response = {er_companies:resultRows};
	    res.json(response);
	});
});

module.exports = router;
