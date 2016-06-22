var vows = require('vows'),
    assert = require('assert');

//require the app
var floodwatch = require('./floodwatch');

var testFW = floodwatch.test;

vows.describe('First test case').addBatch({
	'Hello test': {
		topic: function(){
			return testFW;
		},
		'Test the test': function(topic) {
			assert.equal(topic, 'hello world');
		}
	}
}).run();