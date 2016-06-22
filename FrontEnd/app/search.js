/////////////////////
//search.js - checks for points on the route for intersection with the boxes
//////////////////////

//require the model
var Event = require('./models/event.js');

module.exports = function(computedBoxes, line, callback){
	console.log('Made it to search file');
	//console.log(computedBoxes);

	var points = [];

	if(computedBoxes){
		var count = computedBoxes.length;

		//calls every time the loop runs
		var callCallback = function() {
			if(count === 0){
				//callback function expects arrays of the line and points
				callback(points, line, computedBoxes);
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

			Event.find({Coordinates: {
				$geoWithin: {
					$geometry: {
						type: "Polygon", 
						coordinates: [element] 
					}
						}
					}
				}, function(err, events) {

					if(!err){
						//console.log(events);
						//add the point to the array
						events.forEach(function(elem) {
							points.push(elem);
						})

					} else {
						console.log(err);
					}

					//subtracts the count and calls the callback function
					count--;
					callCallback();
				});

			return points;

		});
	} else {
		callback(points, line, computedBoxes);
	}


	
};

