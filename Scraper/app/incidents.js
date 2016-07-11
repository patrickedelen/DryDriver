//make requests to get the data
var request = require('request');
var async = require('async');
//mongoose for IDs
var mongoose = require('mongoose');

//mongoose model
var modelIncident = require('./models/incident.js');



//remove extra spaces from any strings and return the result
var cleanString = function(string) {
	var spaces = 0;
	for(var i = string.length - 1; i >= 0; i--){
		//console.log('Looping, i: ' + i + ', char:' + string.charAt(i) + '.');
		if(string.charAt(i) == ' '){
			spaces++;
		} else {
			break;
		}
	}
	var content = string.length - spaces;
	return string.slice(0, content);
}

//needs to be the form 4/18/2016 7:00:00 AM
var fixDate = function(badDate) {
	var fixedDate = '';
	var am = true;

	//month
	if(badDate.charAt(5) != 0) {fixedDate += badDate.charAt(5);}
	fixedDate += badDate.charAt(6);
	fixedDate += '/';

	//day
	if(badDate.charAt(8) != 0) {fixedDate += badDate.charAt(8);}
	fixedDate += badDate.charAt(9);
	fixedDate += '/';

	//year
	fixedDate += badDate.substring(0, 4);
	fixedDate += ' ';

	//hour
	if(parseInt(badDate.substring(11, 13)) > 12) {
		am = false;
		fixedDate += (parseInt(badDate.substring(11, 13)) - 12);
	} else if(parseInt(badDate.substring(11, 13)) === 12) {
		am = false;
		fixedDate += badDate.substring(11, 13);
	} else {
		fixedDate += badDate.substring(11, 13);
	}
	fixedDate += ':';

	//minute
	fixedDate += badDate.substring(14, 16);
	fixedDate += ':';

	//second
	fixedDate += badDate.substring(17, 19);
	fixedDate += ' ';

	//AM or PM
	if(am) {
		fixedDate += 'AM';
	} else {
		fixedDate += 'PM';
	}

	//console.log(badDate);
	//console.log(fixedDate);

	return fixedDate;

}

//cleans all the strings in a line variable
//takes unsplit line as the variable
var cleanStrings = function(lineUnSplit) {

	var line = lineUnSplit.split('|');
	var cleaned = {};

	//latitude
	cleaned.latitude = parseFloat(cleanString(line[1]));
	//longitude
	cleaned.longitude = parseFloat(cleanString(line[2]));
	//address
	cleaned.address = cleanString(line[3]);
	//date
	cleaned.date = fixDate(line[4]);
	//id
	cleaned.id = parseInt(line[8]);

	return cleaned;

}


	module.exports.getCurrent311 = function(callback) {
		var url = 'http://houstontx.gov/heatmaps/datafiles/floodingheatmap24all.txt';
		
		request(url, function(err, resp, body) {
			console.log('Requesting reports from the last 30 days...');
			var reports = body.split('\n');
			var reportsObj = [];

			for(var i = 2; i < reports.length - 3; i ++) {
				//clean the strings and add them to the object
				var reportObj = cleanStrings(reports[i]);
				reportsObj.push({
					_id        : new mongoose.Types.ObjectId,
					Date       : reportObj.date,
					Loc: {
						type: 'Point',
						coordinates: [reportObj.longitude, reportObj.latitude],
					},
					ReportType : '311',
					Address    : reportObj.address
				});
					
			}
			callback(reportsObj);
		});

	}

	module.exports.getMonth311 = function(callback) {
		var url = 'http://houstontx.gov/heatmaps/datafiles/floodingheatmap30d.txt';
		
		request(url, function(err, resp, body) {
			console.log('Requesting reports from the last 30 days...');
			var reports = body.split('\n');
			var reportsObj = [];

			for(var i = 2; i < reports.length - 3; i ++) {
				//clean the strings and add them to the object
				var reportObj = cleanStrings(reports[i]);
				reportsObj.push({
					_id        : new mongoose.Types.ObjectId,
					Date       : reportObj.date,
					Loc: {
						type: 'Point',
						coordinates: [reportObj.longitude, reportObj.latitude],
					},
					ReportType       : '311',
					Address    : reportObj.address
				});
					
			}
			callback(reportsObj);
		});

	}

	module.exports.getYear311 = function(callback) {
		var url = 'http://houstontx.gov/heatmaps/datafiles/floodingheatmap12m.txt';
		
		request(url, function(err, resp, body) {
			console.log('Requesting reports from the last 30 days...');
			var reports = body.split('\n');
			var reportsObj = [];

			for(var i = 2; i < reports.length - 3; i ++) {
				//clean the strings and add them to the object
				var reportObj = cleanStrings(reports[i]);
				reportsObj.push({
					_id         : new mongoose.Types.ObjectId,
					Date       : reportObj.date,
					Loc: {
						type: 'Point',
						coordinates: [reportObj.longitude, reportObj.latitude],
					},
					ReportType       : '311',
					Address    : reportObj.address
				});
					
			}
			callback(reportsObj);
		});

	}


	//insert incidents in the database
	module.exports.insertIncidents = function(incidents, callback) {
		
		modelIncident.collection.insert(incidents, /*{w: 0},*/ function(err, docs) {
			if(err) {
				console.log(err);
			} else {
				console.log('Inserted documents');
			}

			modelIncident.ensureIndexes({point:"2dsphere"}, function(err) {
				if(err) {
					console.log(err);
				} else {
					console.log('Created indexes');
				}

				callback();
			});

		});

	}

	//insert one document
	module.exports.insertCurrentIncidents = function(currentIncidents, callback) {
		async.each(currentIncidents, function(element) {
			modelIncident.where('Date', element.Date, function(incidentsReturned) {
				if(!incidentsReturned) {
					try {
						db.products.insertOne( element );
					} catch (e) {
						print (e);
					};
				} else {
					console.log('Incident already inserted');
					console.log(incidentsReturned);
				}
			});

		}, function(err) {
			console.log('Inserted all current incidents');
			if(err) {
				console.log(err);
			}
			callback();
		})
	}

	//checking $near
	module.exports.checkNear = function(coords, callback) {

		setTimeout(function() {
		modelIncident.where('Loc').near({
			center: {
				type: 'Point',
				coordinates: coords
			},
			maxDistance: 2000
		}).exec(function(err, list) {
			if(err) {
				console.log('err: ' + err);
			} else {
				console.log('Data: ' + list);
			}
			callback();
		});
	}, 200)
		
		// modelIncident.find({Coordinates: {
		// 		$near: {
		// 			$geometry: {
		// 				type: "Point",
		// 				Coordinates: coords
		// 			},
		// 			$maxDistance: 20000
		// 		}
		// 	}}, function(err, incidentsList) {
		// 		if(err) {
		// 			console.log(err);
		// 		} else {
		// 			console.log(incidentsList);
		// 		}
				
		// 		callback();
		// 	});
	}
