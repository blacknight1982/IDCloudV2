var express = require('express');
var router = express();

/* GET home page. */
router.get('/', function (req, res, next) {

    res.render('contacts', {title: 'IDCloud Key Contributors'});
});

module.exports = router;