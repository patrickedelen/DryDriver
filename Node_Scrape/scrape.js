var request = require('request');
var cheerio = require('cheerio');

var url = 'http://houstontx.gov/heatmaps/datafiles/floodingheatmap72all.txt';
console.log('Working!');

var findAddress = function(body) {
	var lines = body.split('\n');

	console.log('Line 1: ' + lines[2]);

	var address = lines[2].split('|')[3];
	console.log('Line 1 Address: ' + address);
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