var express = require('express');
var router = express();

/* GET home page. */
router.get('/', function (req, res, next) {

    res.render('index', {title: 'IDCloud Trading Tool'});
});

module.exports = router;