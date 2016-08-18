//Searches the DB for active incidents around the path

//require the model
var Incident = require('./models/incident.js');
//require async
var async    = require('async');

module.exports.searchAlongRoute = function(polyline, callback) {
    console.log('Searching along the route...');

    var points = {
        'historical' : [],
        'police' : [],
        'user' : []
    };

    async.each(polyline, function(element, callback) {
        Incident.where('Loc').near({
            center: {
                type: 'Point',
                coordinates: element
            },
            maxDistance: 200
        }).exec(function(err, incidents) {
            if(err) {
                callback(err);
            } else {
                incidents.forEach(function(elem) {
                    if(elem.ReportType == '311') {
                        points.historical.push(elem);
                    } else if(elem.ReportType == '911') {
                        points.police.push(elem);
                    } else {
                        points.user.push(elem);
                    }
                });
                callback();
            }
        });
    }, function(err) {
        if(err) {
            callback(err, points);
        } else {
            console.log('Finished searching along the route');
            callback(null, points);
        }
    });

}

module.exports.getAll = function(cb)  {

    async.series({
        police: function(callback) {
            Incident.find({"ReportType": "911"}).exec(function(err, incidents) {
                if(err) {
                    callback(err);
                } else {
                    callback(null, incidents);
                }
            });
        },
        historical: function(callback) {
            Incident.find({"ReportType": "311"}).exec(function(err, incidents) {
                if(err) {
                    callback(err);
                } else {
                    callback(null, incidents);
                }
            });
        },
        user: function(callback) {
            Incident.find({"ReportType": "user"}).exec(function(err, incidents) {
                if(err) {
                    callback(err);
                } else {
                    callback(null, incidents);
                }
            });
        }

    }, function(err, results) {
        if(err) {
            cb(err);
        } else {
            cb(null, results);
        }
    });
}