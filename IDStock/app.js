/**
 * Module dependencies.
 */

var express = require('express'), routes = require('./routes/index'), user = require('./routes/user'), decay = require('./routes/decay'), accesslog = require('./routes/accesslog'), http = require('http'), path = require('path');
var db = require('./modules/persistence/db');
var ercal = require('./routes/ercal');
var ercal_ehp = require('./routes/ercal_ehp');
var ercalhistory = require('./routes/ercalhistory');
var custom = require('./routes/custom');
var industryperf = require('./routes/industryperf');

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
app.use('/trading/ercal', ercal);
app.use('/trading/ercalehp', ercal_ehp);
app.use('/trading/decay', decay);
app.use('/trading/ercalhistory', ercalhistory);
app.use('/trading/industryperf', industryperf);
app.use('/trading/custom', custom);
app.all('/trading/*', accesslog);

//app.get('/', routes.index);
//app.get('/users', user.list);

db.connect(db.MODE_PRODUCTION, function(err) {
	if (err) {
		console.log('Unable to connect to MySQL.');
		process.exit(1);
	} else {
		http.createServer(app).listen(app.get('port'), function() {
			console.log('Express server listening on port ' + app.get('port'));
		});
	}
});
