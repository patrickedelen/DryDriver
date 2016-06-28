var request = require('request');
var cheerio = require('cheerio');
//safejson for async parsing
var safejson = require('safejson');
//load elasticsearch for different db
var elasticsearch = require('elasticsearch');

//MySQL setup
var mysql = require('mysql');
var connection = mysql.createConnection({
  host     : 'HOST',
  user     : 'root',
  password : 'PW',
  port     : '3306',
  database : 'historical'
});

connection.connect(function(err){});


var url = 'http://houstontx.gov/heatmaps/datafiles/floodingheatmap30d.txt';

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

	var cleaned = [];

	//latitude
	cleaned[0] = cleanString(line[1]);
	//longitude
	cleaned[1] = cleanString(line[2]);
	//address
	cleaned[2] = cleanString(line[3]);
	//date
	cleaned[3] = fixDate(line[4]);

	return cleaned;

}

var generateHistory = function(record){

	var table = 'INSERT INTO month VALUES (' + record[0] + ',\n' + record[1];
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

var findAddress = function(body) {
	var lines = body.split('\n');

	console.log('Line 1: ' + lines[2]);

	var line = lines[2];

	var address = lines[2].split('|')[3];


	console.log('Line 1 Address: ' + cleanString(address) + '');
}

var getCountHistory = function(body, count){
	var lines = body.split('\n');

	for(var i = 2; i < (2 + count); i++) {
		setTimeout(function(i){
			var record = cleanStrings(lines[i]);
			console.log('Running record number: ' + i + ', values: ' + record);
			generateHistory(record);
		}, (500 * i), i);

	}

}

request(url, function(err, resp, body){
	console.log('requesting...');
	var count = body.split('\n').length;
	console.log(count);

	//get the history for the set number of records
	getCountHistory(body, count);


	//findAddress(body);
  // $ = cheerio.load(body);
  // links = $('.sb_tlst h3 a'); //selecting the address
  // $(links).each(function(i, link){
  //   console.log($(link).text() + ':\n  ' + $(link).attr('href'));
  // });
});

var connectElastic = function() {

	var client = new elasticsearch.Client({
		hosts: [
			'https://root:1234Pizza@sl-us-dal-9-portal2.dblayer.com:10642',
			'https://root:1234Pizza@sl-us-dal-9-portal2.dblayer.com:10621'
		]
	});

	client.cluster.health({}, function(err, res, status) {
		console.log('Elasticsearch status:');
		console.log(res);
	});
}



////////////////////////////////////////////
//Functions made for getting current and past rainfall data
////////////////////////////////////////////
var getRainfallData = function() {
	//request the rainfall data
	console.log('Requesting present rainfall data');	
	var rainUrl = 'http://www.harriscountyfws.org/Home/GetSiteRecentData';
	request.post({url: rainUrl, form: {regionId: 1, timeSpan: 1, dt: 1466781285071}}, function(err, res, body) {
		if(!err){
			//console.log(res);
			safejson.parse(body, function(err, rainfall) {
				if(!err) {
					//console.log(rainfall);
					//log each site location and rainfall
					console.log('Printing present rainfall data...');
					for(var i = 0; i < rainfall.Sites.length; i++) {
						console.log('Rainfall at ' + rainfall.Sites[i].Longitude + ', ' + rainfall.Sites[i].Latitude + ' was ' + rainfall.Sites[i].Rainfall);
					}

				} else {
					console.log(err);
				}
			})
		} else {
			console.log(err);
		}

	});

	//Testing historical data gathering
	console.log('Requesting historical rainfall data');	
	var rainUrl = 'http://www.harriscountyfws.org/Home/GetSiteHistoricRainfall';
	request.post({url: rainUrl, form: {regionId: 1, endDate: '4/18/2016 7:00:00 AM', interval: 60, unit: 'mi'}}, function(err, res, body) {
		if(!err){
			//console.log(res);
			safejson.parse(body, function(err, rainfall) {
				if(!err) {
					//console.log(rainfall);
					//log each site location and rainfall
					console.log('\nPrinting historical rainfall data...');
					for(var i = 0; i < rainfall.Sites.length; i++) {
						console.log('Rainfall at ' + rainfall.Sites[i].Longitude + ', ' + rainfall.Sites[i].Latitude + ' was ' + rainfall.Sites[i].Rainfall);
					}

				} else {
					console.log(err);
				}
			})
		} else {
			console.log(err);
		}

	});
}