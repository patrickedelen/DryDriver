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