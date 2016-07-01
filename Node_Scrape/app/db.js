//load elasticsearch for different db
var elasticsearch = require('elasticsearch');

var connectElastic = function() {

	var client = new elasticsearch.Client({
		hosts: [
			'https://root:1234Pizza@sl-us-dal-9-portal2.dblayer.com:10642',
			'https://root:1234Pizza@sl-us-dal-9-portal2.dblayer.com:10621'
		]
	});

	client.cluster.health({}, function(err, res, status) {
		console.log('Elasticsearch status:');
		console.log(res);
	});
}


