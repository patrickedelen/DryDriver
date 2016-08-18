//Stores locations of users and alerts users when an alert/incident happens near their location

//in the future, report incidents to http://311selfservice.houstontx.gov/Ef3/General.jsp?form=PWE_Street_WEB&page=SSP_Page_EmailEnter

var async = require('async');
//mongoose for IDs
var mongoose = require('mongoose');

//mongoose model
var Incident = require('./models/incident.js');

module.exports = function(io) {

  io.on('connection', function(socket){
    console.log('user connected');
    socket.on('disconnect', function(){
      console.log('user disconnected');
    });
    socket.on('report', function(alert){
      io.emit('new report', alert);
      console.log('Report location: ');
      console.log(alert);

      var userIncident = {
        _id: new mongoose.Types.ObjectId,
        Date: Date.now(),
        Loc: {
          type: 'Point',
          coordinates: [alert.longitude, alert.latitude]
        },
        ReportType: 'user',
        Address: 'User reported location'
      };

      Incident.collection.insert(userIncident, /*{w: 0},*/ function(err, docs) {
			if(err) {
				console.log(err);
			} else {
				console.log('Inserted documents');
			}

			Incident.ensureIndexes({point:"2dsphere"}, function(err) {
				if(err) {
					console.log(err);
				} else {
					console.log('Created indexes');
				}

			});

		});

    });
  });

}