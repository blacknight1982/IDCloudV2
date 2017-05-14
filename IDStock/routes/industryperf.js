/**
 * Created by John Liu on 05/09/2016.
 */

var express = require('express');
var logger = require('../modules/logging/logger')(module);
var async = require('async');
var router = express();
var db = require('../modules/persistence/db');


/* GET home page. */
router.get('/', function (req, res, next) {
	
	var queryString = "select distinct cbeh.industry AS industry,round(avg(cbeh.percent_twoday),2) AS average_return,   round((avg(cbeh.percent_twoday) / std(cbeh.percent_twoday)),2) AS z_value,count(cbeh.industry) AS sample_count ,   median.median_val    from company_basic_ercal_history cbeh ,   (SELECT sq.industry, avg(sq.percent_twoday) as median_val FROM ( SELECT t1.row_number, t1.percent_twoday, t1.industry FROM( SELECT IF(@prev!=cbeh.industry, @rownum:=1, @rownum:=@rownum+1) as `row_number`, cbeh.percent_twoday, @prev:=cbeh.industry AS industry FROM (select * from company_basic_ercal_history order by industry) cbeh, (SELECT @rownum:=0, @prev:=NULL) r where (cbeh.rdate >= (now() - interval 4 month)) ORDER BY industry, percent_twoday ) as t1 INNER JOIN   (   SELECT count(*) as total_rows, industry    FROM company_basic_ercal_history cbeh   where (cbeh.rdate >= (now() - interval 4 month))   GROUP BY industry ) as t2 ON t1.industry = t2.industry WHERE 1=1 AND t1.row_number>=t2.total_rows/2 and t1.row_number<=t2.total_rows/2+1 )sq group by sq.industry) median    where   median.industry=cbeh.industry  and (cbeh.rdate >= (now() - interval 4 month)) group by cbeh.industry;";
	db.get().query(queryString, function(err, rows, fields) {
    	if (err) {
            logger.log('error',err);
        }
    	res.render('industryperf', {title: 'Industry ER Performance', industries: rows});
    });
});

router.post('/', function (req, res, next) {
	
});

module.exports = router;
