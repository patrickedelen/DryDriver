var request    = require('request');
var async      = require('async');

var transtarUrl = 'http://traffic.houstontranstar.org/data/layers/incidents_json.js';

request.get(transtarUrl, function(err, data) {
    console.log(data);
});