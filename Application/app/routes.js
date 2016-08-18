//all HTTP routes for the app

var getPath = require('./getPath.js');
var searchIncidents = require('./searchIncidents.js');

module.exports = function(app) {

    app.get('/', function(req, res) {
		res.sendFile(__dirname + '/index_new.html');
	});

	app.all('/route', function(req, res, next) {
	  res.header("Access-Control-Allow-Origin", "*");
	  res.header("Access-Control-Allow-Headers", "X-Requested-With");
	  next();
	 });

     app.post('/route', function(req, res) {

		var params = {
			origin: req.body.origin,
			destination: req.body.destination
		};
        console.log('Currently routing:');
		console.log('Origin: ' + params.origin + ', Destination: ' + params.destination);

		getPath(params, function(err, response){
				if(err) {
					console.log(err);
					res.json({'error' : err});
				} else {
					console.log('Sending response...');
					res.json(response);
				}
				
			});
		
	});

	app.get('/route/all', function(req, res) {
		searchIncidents.getAll(function(err, incidents) {
			if(err) {
				res.json({'error': err});
			} else {
				res.json(incidents);
			}
		});
	});

}
