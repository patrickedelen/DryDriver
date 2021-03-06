/////////////////////
//search.js - checks for points on the route for intersection with the boxes
//////////////////////

//require the model
var Event = require('./models/event.js');
var Incident = require('./models/incident.js');

module.exports = function(computedBoxes, line, callback){
	console.log('Made it to search file');
	//console.log(computedBoxes);

	var points = [];
	var time   = Date.now();
	if(computedBoxes){

		//search along the boxes

		// /////////////////
		// //search using one polygon
		// 	Event.find({Coordinates: {
		// 		$geoWithin: {
		// 			$geometry: {
		// 				type: "Polygon", 
		// 				coordinates: [computedBoxes] 
		// 			}
		// 				}
		// 			}
		// 		}, function(err, events) {

		// 			if(!err){
		// 				//console.log(events);
		// 				//add the point to the array
		// 				events.forEach(function(elem) {
		// 					points.push(elem);
		// 				})

		// 			} else {
		// 				console.log(err);
		// 			}

		// 			//calls the callback function
		// 			callback(points, line, computedBoxes);
		// 			var delta = Date.now() - time;
		// 			console.log('That took: ' + delta);
		// 		});
		// //end
		// /////////////////////

		var count = computedBoxes.length;

		//calls every time the loop runs
		var callCallback = function() {
			if(count === 0){
				//callback function expects arrays of the line and points
				callback(points, line, computedBoxes);
				var delta = Date.now() - time;
					console.log('Total time: ' + delta + 'ms');
			}
		}

		//for each box find pins in it
		computedBoxes.forEach(function(element, index) {
			//print box coords
			// console.log('Box ' + index);
			// console.log(element);

			// Event.find(function(err, events) {

			// 		if(!err){
			// 			console.log(events);
			// 		} else {
			// 			console.log(err);
			// 		}

			// 	}).limit(5);


			//search near each point
			//console.log('Checking location: ' + element);
			Incident.where('Loc').near({
				center: {
					type: 'Point',
					coordinates: element
				},
				maxDistance: 200
			}).exec(function(err, incidents) {
				if(err) {
					console.log(err);
				} else {
					incidents.forEach(function(elem) {
						points.push(elem);
					});
				}
				//subtracts the count and calls the callback function
				count--;
				callCallback();
			});

// /////////////////////////////////////////
// //HEY THAT CODE IS RIGHT HERE
// /////////////////////////////////////////
// 			Event.find({Coordinates: {
// 				$geoWithin: {
// 					$geometry: {
// 						type: "Polygon", 
// 						coordinates: [element] 
// 					}
// 						}
// 					}
// 				}, function(err, events) {

// 					if(!err){
// 						//console.log(events);
// 						//add the point to the array
// 						events.forEach(function(elem) {
// 							points.push(elem);
// 						})

// 					} else {
// 						console.log(err);
// 					}

// 					//subtracts the count and calls the callback function
// 					count--;
// 					callCallback();
// 				});
// ////////////////////////////////////////////
// //END OF THAT CODE
// ///////////////////////////////////////////

			return points;

		});
	} else {
		callback(points, line, computedBoxes);
	}


	
};

