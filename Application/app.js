//require web server stuff
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));

//set the static route
app.use('/public', express.static(__dirname + '/public'));

// start up mongodb
var db = mongoose.connect(process.env.DD_MONGO, function(err) {
//log database status
	if(err) {
		console.log(err);
	} else {
		console.log("DB connected...");
	}
});

require('./app/routes.js')(app);

console.log('Application server running...');

var port = process.env.DD_PORT;

http.listen(port, function() {
	console.log('Server active on port ' + port);
});

//start socket.io server
var userAlerts = require('./app/userAlerts.js')(io);

//allow the web server and database to be stopped
function close(){	
	http.close(function() {
		console.log('Web server stopped');
		db.disconnect();
		console.log('Database stopped');
	});

}

exports.close = close;
exports.test = 'hello world';