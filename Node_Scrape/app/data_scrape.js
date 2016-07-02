//make requests to get the data
var request = require('request');
var async = require('async');

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
	cleaned.latitude = cleanString(line[1]);
	//longitude
	cleaned.longitude = cleanString(line[2]);
	//address
	cleaned.address = cleanString(line[3]);
	//date
	cleaned.date = fixDate(line[4]);

	return cleaned;

}


	module.exports.getCurrentReports = function() {
		var url = 'http://houstontx.gov/heatmaps/datafiles/floodingheatmap72h.txt';
		var reportsObj =  {};

		request(url, function(err, resp, body) {
			console.log('Requesting reports from the last 30 days...');
			console.log(body);
			var reports = body.split('\n');

			for(var i = 2; i < reports.length; i ++) {
				//clean the strings and add them to the object
				reportsObj.push(cleanStrings(reports[i]));
			}
			

		});

		return reportsObj;

	}

	module.exports.getMonthReports = function(callback) {
		var url = 'http://houstontx.gov/heatmaps/datafiles/floodingheatmap72outside.txt';
		
		request(url, function(err, resp, body) {
			console.log('Requesting reports from the last 30 days...');
			var reports = body.split('\n');
			var reportsObj = {};

			for(var i = 2; i < reports.length - 3; i ++) {
				//clean the strings and add them to the object
				var reportObj = cleanStrings(reports[i]);
				reportsObj[i - 2] = {
					latitude: reportObj.latitude,
					longitude: reportObj.longitude,
					address: reportObj.address,
					date: reportObj.date
				};
					
			}
			return callback(reportsObj);
		});

	}

	module.exports.getPastReports = function() {

	}


	module.exports.getCurrentPoliceReports = function() {

	}

	module.exports.getMonthPoliceReports = function() {

	}

	module.exports.getPastPoliceReports = function() {

	}
