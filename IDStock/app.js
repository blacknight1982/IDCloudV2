
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes/index')
  , user = require('./routes/user')
  , decaycalc = require('./routes/decaycalc')
  , chart = require('./routes/chart')
  , http = require('http')
  , path = require('path');

var ercal = require('./routes/ercal');
var indicator = require('./routes/indicator');
var etfindicator = require('./routes/etfindicator');

var app = express();

// all environments
app.set('port', process.env.PORT || 80);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.use('/', routes);
app.use('/ercal', ercal);
app.use('/decay', decaycalc);
app.use('/indicator',indicator);
app.use('/etfindicator',etfindicator);
app.use('/chart',chart);

//app.get('/', routes.index);
//app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
