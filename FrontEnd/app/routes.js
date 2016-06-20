/////////////////////////////////
//routes.js - route all api calls to the server
////////////////////////////////

//require app code
var route = require('./route');
var search = require('./search');

var Promise = require('bluebird');

//mongodb model
var Event = require('./models/event.js');

//callback function


module.exports = function(app) {
	app.get('/', function(req, res) {
		res.sendFile(__dirname + '/index.html');
	});

	app.all('/route', function(req, res, next) {
	  res.header("Access-Control-Allow-Origin", "*");
	  res.header("Access-Control-Allow-Headers", "X-Requested-With");
	  next();
	 });

	app.post('/route', function(req, res) {
		console.log('Route called...');

		var params = {
			origin: req.body.origin,
			destination: req.body.destination
		};
		console.log('Origin: ' + params.origin + ' , Destination: ' + params.destination);
		route(params, function(boxes, response){
				console.log('Callback called...');
				search(boxes, response, function(pins, line, boxes){
					console.log('It worked!');
					if(!boxes){
						boxes = [];
					}
					var sendData = {
						'line': line,
						'boxes': boxes,
						'pins': pins
					};

					res.json(sendData);
				});
				
			});
		
	});

	app.all('/report', function(req, res, next) {
	  res.header("Access-Control-Allow-Origin", "*");
	  res.header("Access-Control-Allow-Headers", "X-Requested-With");
	  next();
	 });

	app.post('/report', function(req, res) {
		console.log(req.body.Coordinates);

	});

}