///////////////////////////
//route.js - find map route and make boxes
//////////////////////////

//require polyline to decode polyline
var polyline = require('polyline');

var Promise = require('bluebird');

//routeboxer to generate boxes around the route returned
var RouteBoxer = require('geojson.lib.routeboxer'),
    boxer = new RouteBoxer();

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

//accepts data returned by google maps for the route (first level), returns array of waypoints that the routeboxer can accept
function decode(polylineInput) {
	var decodedPolyline = polyline.decode(polylineInput.points);
	var normalized = [];

	decodedPolyline.forEach(function(element){
		var temp = element[1];
		element[1] = element[0];
		element[0] = temp;

		var value =1 [
			element[0],
			element[1] 
		];

		

		return normalized.push(value);
	});

	console.log(normalized);
	return normalized;
}

//call route(request) where request is an object with origin and destination
module.exports = function(request, callback){

	gmAPI.directions( request, function(err, results) {
		if(!err) {
			//console.log(results);

			//variable to store seteps (higher res polylines)
			var routeSteps = results.routes[0].legs[0].steps;
			console.log('all results');
			//console.log(results);

			for(var i = 0; i < routeSteps.length; i++) {
				//console.log(routeSteps[i].polyline);
			}

			//find the points of the polyline
			var polylineReturned = decode(results.routes[0].overview_polyline);
			//console.log(polylineReturned);

			var jsonData = {
				'type': "MultiPoint",
				'coordinates': polylineReturned
			};
			//console.log(jsonData);

			//create boxes
			var boxes = boxer.box(jsonData, .5);

			//finishes the polygons of the boxes
			boxes.forEach(function(element){
				var currentCoordinates = element.coordinates[0];
				currentCoordinates.push(currentCoordinates[0]);
			});
		} else {
			console.log(err);
		}

		//run the callback
		callback(boxes, polylineReturned);
		console.log('Polyline returned...');
		//console.log(polylineReturned);

		});
	

}