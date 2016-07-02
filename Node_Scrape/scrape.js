var request = require('request');
var cheerio = require('cheerio');
var async = require('async');
//safejson for async parsing
var safejson = require('safejson');
//MySQL setup
var mysql = require('mysql');

////////////////////////////////
//Internal requires
var reports = require('./app/data_scrape.js');
var rainfall = require('./app/rainfall.js');
var db = require('./app/db.js');

var connection = mysql.createConnection({
  host     : '*',
  user     : 'root',
  password : '*',
  port     : '3306',
  database : 'historical'
});

connection.connect(function(err){});


var generateHistory = function(record){

	var table = 'INSERT INTO month VALUES (' + record.longitude + ',\n' + record.latitude;
	console.log('Requesting historical rainfall data');	
	var rainUrl = 'http://www.harriscountyfws.org/Home/GetSiteHistoricRainfall';
	request.post({url: rainUrl, form: {regionId: 1, endDate: record.date, interval: 1440, unit: 'mi'}}, function(err, res, body) {
		if(!err){
			//console.log(res);
			safejson.parse(body, function(err, rainfall) {
				if(!err) {
					//console.log(rainfall);
					//log each site location and rainfall
					console.log('\nGenerating rainfall history for location: ' + record.address + ' at lat: ' + record.latutude + ', lon: ' + record.longitude);
					console.log('Printing historical rainfall data...');
					for(var i = 0; i < 1; i++) {
						//console.log('Rainfall at ' + rainfall.Sites[i].Longitude + ', ' + rainfall.Sites[i].Latitude + ' was ' + rainfall.Sites[i].Rainfall);
					}

				} else {
					console.log(err);
				}

				for(var i = 0; i < rainfall.Sites.length; i++) {
					var col = '';
					var current = rainfall.Sites[i];

					col = ',\n' + current.Latitude + ',\n' + current.Longitude + ',\n' + current.RainfallText;

					table += col;
				}

				table += ');';

				//console.log(table);

				
				connection.query(table, function(err, rows) {
					if(!err){
						console.log(rows);
					} else {
						console.log(err);
					}
					
				});
				
				

			});
		} else {
			console.log(err);
		}

	});

}

var generateTables = function(record){

	var table = 'CREATE TABLE month (IncidentLat double,IncidentLon double';
	console.log('Requesting historical rainfall data');	
	var rainUrl = 'http://www.harriscountyfws.org/Home/GetSiteHistoricRainfall';
	request.post({url: rainUrl, form: {regionId: 1, endDate: record[3], interval: 1440, unit: 'mi'}}, function(err, res, body) {
		if(!err){
			//console.log(res);
			safejson.parse(body, function(err, rainfall) {
				if(!err) {
					//console.log(rainfall);
					//log each site location and rainfall
					console.log('\nGenerating rainfall history for location: ' + record[2] + ' at lat: ' + record[0] + ', lon: ' + record[1]);
					console.log('Printing historical rainfall data...');
					for(var i = 0; i < 1; i++) {
						console.log('Rainfall at ' + rainfall.Sites[i].Longitude + ', ' + rainfall.Sites[i].Latitude + ' was ' + rainfall.Sites[i].Rainfall);
					}

				} else {
					console.log(err);
				}

				for(var i = 0; i < rainfall.Sites.length; i++) {
					var col = '';
					var current = rainfall.Sites[i];

					var id = current.SiteId;

					col = ',Site' + id + 'Lat double,Site' + id + 'Lon double,Site' + id + 'Rain double';

					table += col;
				}

				table += ');';

				
				connection.query(table, function(err, rows) {
					if(!err){
						console.log(rows.length);
					} else {
						console.log(err);
					}
					connection.end();
				});
				
				

			});
		} else {
			console.log(err);
		}

	});

}


//get the per gage flooding history
var generateIndividualHistory = function(record) {
	var table = 'INSERT INTO individual VALUES (' + record[0] + ',\n' + record[1];
	console.log('Requesting historical rainfall data');	
	var rainUrl = 'http://www.harriscountyfws.org/Home/GetSiteHistoricRainfall';
	request.post({url: rainUrl, form: {regionId: 1, endDate: record[3], interval: 1440, unit: 'mi'}}, function(err, res, body) {
		if(!err){
			//console.log(res);
			safejson.parse(body, function(err, rainfall) {
				if(!err) {
					//console.log(rainfall);
					//log each site location and rainfall
					console.log('\nGenerating rainfall history for location: ' + record[2] + ' at lat: ' + record[0] + ', lon: ' + record[1]);
					console.log('Printing historical rainfall data...');
					for(var i = 0; i < 1; i++) {
						//console.log('Rainfall at ' + rainfall.Sites[i].Longitude + ', ' + rainfall.Sites[i].Latitude + ' was ' + rainfall.Sites[i].Rainfall);
					}

				} else {
					console.log(err);
				}

				for(var i = 0; i < rainfall.Sites.length; i++) {
					var col = '';
					var current = rainfall.Sites[i];

					col = ',\n' + current.Latitude + ',\n' + current.Longitude + ',\n' + current.RainfallText;

					table += col;
				}

				table += ');';

				//console.log(table);

				
				connection.query(table, function(err, rows) {
					if(!err){
						console.log(rows);
					} else {
						console.log(err);
					}
					
				});
				
				

			});
		} else {
			console.log(err);
		}

	});

}



async.waterfall([
	function(callback) {
		var incidents = reports.getMonthReports(function(incidents) {
			console.log(incidents);
			callback(null, incidents);
		});
	},
	function(incidents, callback) {
		for(var i = 0; i < Object.keys(incidents).length; i++) {
			setTimeout(function(i){
				console.log('Running record number: ' + i + ', values: ' + incidents[i]);
				//generateHistory(record);
			}, (100 * i), i);
		}

		callback(null, 'done');		
	}
], function(err, result) {
	if(err) {
		console.log(err);
	} else {
		console.log(result)
	}
});

