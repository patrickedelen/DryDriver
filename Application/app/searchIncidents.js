//Searches the DB for active incidents around the path

//require the model
var Incident = require('./models/incident.js');
//require async
var async    = require('async');

module.exports.searchAlongRoute = function(polyline, callback) {
    console.log('Searching along the route...');

    var points = [];

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
                    points.push(elem);
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