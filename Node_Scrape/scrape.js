var request = require('request');
var cheerio = require('cheerio');

var url = 'http://houstontx.gov/heatmaps/datafiles/floodingheatmap72all.txt';
console.log('Working!');

request(url, function(err, resp, body){
	console.log('requesting...' + body);
  $ = cheerio.load(body);
  links = $('.sb_tlst h3 a'); //selecting the address
  $(links).each(function(i, link){
    console.log($(link).text() + ':\n  ' + $(link).attr('href'));
  });
});