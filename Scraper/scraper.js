var request = require('request');
var async = require('async');
//safejson for async parsing
var safejson = require('safejson');
//MySQL
var mysql = require('mysql');
//MongoDB
var mongoose = require('mongoose');


//internal requires
var incidents = require('./app/incidents.js');

///////////////////////////////
//BEGIN APPLICATION SETUP
///////////////////////////////

/////Databases

// start up mongodb
var db = mongoose.connect(process.env.DD_MONGO, function(err) {
//log database status
	if(err) {
		console.log(err);
	} else {
		console.log("MongoDB connected...");
	}
});

//start MySQL
var connection = mysql.createConnection({
  host     : process.env.DD_DB_HOST,
  user     : 'root',
  password : process.env.DD_DB_PW,
  port     : '3306',
  database : 'historical'
});
connection.connect(function(err){
	if(err) {
		console.log(err);
	} else {
		console.log("MySQL DB connected...");
	}
});


//terminates the database connections
var terminate = function(){
	console.log('Terminating database connections');
	connection.end();
	db.disconnect();
}

////End Databases


////scheduler
// var schedule = require('node-schedule');
// var s = schedule.scheduleJob('* * * * /5', function(){
//   console.log('Checking all incidents...');
//   check();
// });


///////////////////////////////
//END APPLICATION SETUP
//
//START APPLICATION LOGIC
///////////////////////////////

var checkLocation = function() {
	var coords = [-95.342853, 29.766441];
	console.log('checking near coords');

	incidents.checkNear(coords, function() {
		console.log('got the callback!');
		terminate();
	})
}



var saveMonthIncidents = function() {
	var startTime = Date.now();
	async.waterfall([
		function(callback) {
			incidents.getMonth311(function(returnedIncidents) {
				//incidents scraped callback
				callback(null, returnedIncidents);
			});
		},
		function(returnedIncidents, callback) {
			incidents.insertIncidents(returnedIncidents, function() {
				//incidents inserted callback
				callback(null, 'Done with month incident save');
			})
		}
	], function(err, result) {
		if(err) {
			console.log(err);
		} else {
			console.log(result);
			console.log('Total time was ' + (Date.now() - startTime) + ' ms.');
		}
		checkLocation();
	});
}

var saveYearIncidents = function() {
	var startTime = Date.now();
	async.waterfall([
		function(callback) {
			incidents.getYear311(function(returnedIncidents) {
				//incidents scraped callback
				callback(null, returnedIncidents);
			});
		},
		function(returnedIncidents, callback) {
			incidents.insertIncidents(returnedIncidents, function() {
				//incidents inserted callback
				callback(null, 'Done with year incident save');
			})
		}
	], function(err, result) {
		if(err) {
			console.log(err);
		} else {
			console.log(result);
			console.log('Total time was ' + (Date.now() - startTime) + ' ms.');
		}
		terminate();
	});
}

//saveMonthIncidents();
checkLocation();
//saveYearIncidents();
