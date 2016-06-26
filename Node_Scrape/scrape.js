var request = require('request');
var cheerio = require('cheerio');
//safejson for async parsing
var safejson = require('safejson');
//load elasticsearch for different db
var elasticsearch = require('elasticsearch');


var url = 'http://houstontx.gov/heatmaps/datafiles/floodingheatmap72all.txt';

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


var findAddress = function(body) {
	var lines = body.split('\n');

	console.log('Line 1: ' + lines[2]);

	var address = lines[2].split('|')[3];


	console.log('Line 1 Address: ' + cleanString(address) + '_');
}

request(url, function(err, resp, body){
	console.log('requesting...');
	findAddress(body);
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