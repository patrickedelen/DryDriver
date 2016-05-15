/////////////////////////////////
//routes.js - route all api calls to the server
////////////////////////////////

//require app code
var route = require('./route');
var search = require('./search');

var Promise = require('bluebird');

//callback function


module.exports = function(app) {
	app.post('/route', function(req, res) {

		var params = {
			origin: req.body.origin,
			destination: req.body.destination
		};
		console.log('Origin: ' + params.origin + ' , Destination: ' + params.destination);
		route(params, function(boxes, response){
				console.log('Callback called...');
				search(boxes, response, function(pins, line, boxes){
					console.log('It worked!');
					var sendData = {
						'line': line,
						'boxes': boxes,
						'pins': pins
					};

					res.json(sendData);
				});
				
			});
		
		
	});

}