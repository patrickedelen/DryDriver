//require basic stuff
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: false }));

//set the static route
app.use('/public', express.static(__dirname + '/public'));

//require app code
var route = require('./app/route');
var search = require('./app/search');

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

console.log('running!');

var port = process.env.DD_PORT;

http.listen(port, function() {
	console.log('Server active on port ' + port);
});
//allow the web server to be closed
function close(){	
	http.close(function() {
		console.log('Web server stopped');
		db.disconnect();
		console.log('Mongoose stopped');
	});

}

var params = {
	origin: '29.7520018,-95.3755103',
	destination: '29.755877,-95.381304'
};

function callB(boxes){
	console.log('Callback called...');
	search(boxes);
}

//route(params, callB);
exports.close = close;
exports.test = 'hello world';