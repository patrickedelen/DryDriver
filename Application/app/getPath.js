///////////////////////////
//getPath.js - find map route and make boxes
//uses GMAPS API to get the route and returns an array of points to search
//////////////////////////

//require search file to search for points
var searchIncidents = require('./searchIncidents.js');

//require polyline to decode polyline
var polyline = require('polyline');
//require async
var async = require('async');

//google maps api
var GoogleMapsAPI = require('googlemaps');
var mapsConfig = {
	key: 'AIzaSyBMDV4_xucQMtPhCWmxG5fa5OGpjgi07Ik',
	stagger_time:       1000, // for elevationPath
  	encode_polylines:   false,
  	secure:             true // use https
}
//create google maps api object
var gmAPI = new GoogleMapsAPI(mapsConfig);

var polyPoints = []

//decodes the encoded polyline into an array of points
function decode(polylineInput) {
	var decodedPolyline = polyline.decode(polylineInput.points);
	var normalized = [];

	decodedPolyline.forEach(function(element){
		var temp = element[1];
		element[1] = element[0];
		element[0] = temp;

		var value = [
			element[0],
			element[1] 
		];

		return normalized.push(value);
	});

	//console.log(normalized);
	return normalized;
}


//call route(request) where request is an object with origin and destination
//end call with cb(all data to be sent to the user)
module.exports = function(request, cb){
	var startTime = Date.now();
	
	async.waterfall([
		function(callback) {

			gmAPI.directions(request, function(err, results) {
				if(!err) {
					//get the route overview path
					//var routeSteps = results.routes[0].legs[0].steps;
					//decode the polyline
					var polylineDecoded = decode(results.routes[0].overview_polyline);

					//call the next function
					callback(null, polylineDecoded);
					
				} else {
					callback(err, polylineDecoded);
				}

			});

		},
		function(polylineDecoded, callback) {

			searchIncidents.searchAlongRoute(polylineDecoded, function(err, incidents) {
				console.log('Finished searching along path');

				//call the function to return the data
				if(err) {
					callback(err, polylineDecoded, incidents);
				} else  {
					callback(null, polylineDecoded, incidents);
				}
			});

		}
	], function(err, polylineDecoded, incidents) {
		if(err) {
			console.log('Error on route building/searching');
			cb(err, null);
		} else {
			console.log('Total time was ' + (Date.now() - startTime) + ' ms.');

			var response = {
				'line': polylineDecoded,
				'pins': incidents
			};

			//call the routes file's callback to send the response
			cb(null, response);

		}

	});
	
}