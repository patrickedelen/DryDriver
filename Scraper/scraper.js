var request    = require('request');
var async      = require('async');
//safejson for async parsing
var safejson   = require('safejson');
//MySQL
var mysql      = require('mysql');
//MongoDB
var mongoose   = require('mongoose');
//mongoose.set('debug', true);

var MongoClient = require('mongodb').MongoClient,
  test = require('assert');

//internal requires
var incidents  = require('./app/incidents.js');
var rainGauges = require('./app/raingauges.js');

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
function terminate(){
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

function checkLocation() {
	var coords = [-95.342853, 29.766441];
	console.log('checking near coords');

	incidents.checkNear(coords, function() {
		console.log('got the callback!');
		terminate();
	})
}



function saveCurrentIncidents() {
	var startTime = Date.now();
	async.waterfall([
		function(callback) {
			incidents.getCurrent311(function(returnedIncidents) {
				//incidents scraped callback
				callback(null, returnedIncidents);
			});
		},
		function(returnedIncidents, callback) {
			incidents.insertCurrentIncidents(returnedIncidents, function() {
				//incidents inserted callback
				callback(null, 'Done with current incident save');
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

function saveMonthIncidents() {
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

function saveYearIncidents() {
	var startTime = Date.now();
	async.waterfall([
		function(callback) {
			incidents.getYear311(function(returnedIncidents) {
				//incidents scraped callback
				callback(null, returnedIncidents);
			});
		},
		function(returnedIncidents, callback) {
			incidents.insertIncidentsSafe(returnedIncidents, function() {
				//incidents inserted callback
				callback(null, 'Done with year incident save');
			});
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

 

//generate table schema
function generateTables(callback) {
	var createQuery = 'CREATE TABLE monthRain (GaugeNumber Integer,FloodProbability Integer,Rainfall Double);';

	connection.query(createQuery, function(err, rows) {
		if(!err){
			console.log(rows.length);
		} else {
			console.log(err);
		}

		callback();
	});

}

function getCurrentPolice(cb) {
var startTime = Date.now();
	async.waterfall([
		function(callback) {
			incidents.getCurrentPolice(function(returnedIncidents) {
				//incidents scraped callback
				callback(null, returnedIncidents);
			});
		}
	], function(err, result) {
		if(err) {
			console.log(err);
		} else {
			console.log(result);
			console.log('Total time was ' + (Date.now() - startTime) + ' ms.');
		}
		cb();
	});
}

function saveAllPolice() {
	var startTime = Date.now();
	async.waterfall([
		function(callback) {
			incidents.getAllPolice(function(returnedIncidents) {
				//incidents scraped callback
				console.log('Total number of police incidents was ' + returnedIncidents.length);
				callback(null, returnedIncidents);
			});
		},
		function(returnedIncidents, callback) {
			incidents.insertIncidentsSafe(returnedIncidents, function() {
				//incidents inserted callback
				callback(null, 'Done with police incident save');
			});
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

//loop through month dates and insert into database



//saveYearIncidents();
//saveMonthIncidents();
//saveCurrentIncidents();

//checkLocation();


// generateTables(function() {
// 	terminate();
// });

// getCurrentPolice(function() {
// 	terminate();
// });

// incidents.getAllPolice(function(reports) {
// 	console.log(reports);
// 	terminate();
// });

saveAllPolice();

db.system.profile.find({ 
  "Date" : { 
    $lt: new Date(), 
    $gte: new Date(new Date().setDate(new Date().getDate()-1))
  }   
})