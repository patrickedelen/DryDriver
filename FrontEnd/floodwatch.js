//require basic stuff
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: false }));

//require app code
var route = require('./app/route');
var search = require('./app/search');

// start up mongodb
mongoose.connect('mongodb://root:1234Pizza@ds023432.mlab.com:23432/drydriver', function(err) {
//log database status
	if(err) {
		console.log(err);
	} else {
		console.log("DB connected...");
	}
});

require('./app/routes.js')(app);

console.log('running!');

http.listen(8008, function() {
	console.log('Server active on port 8008');
});


var params = {
	origin: '29.7520018,-95.3755103',
	destination: '29.755877,-95.381304'
};

function callB(boxes){
	console.log('Callback called...');
	search(boxes);
}

//route(params, callB);