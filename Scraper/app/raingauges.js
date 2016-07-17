//make requests to get the data
var request = require('request');
var async = require('async');
//mongoose for IDs
var mongoose = require('mongoose');

//raingauge model
var modelGauge = require('./models/gauge.js');

	module.exports.generateGaugeInfo = function() {
		//request the rainfall data
		console.log('Requesting present rainfall data');	
		var rainUrl = 'http://www.harriscountyfws.org/Home/GetSiteRecentData';
		request.post({url: rainUrl, form: {regionId: 1, timeSpan: 1}}, function(err, res, body) {
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
	}