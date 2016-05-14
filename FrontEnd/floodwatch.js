var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

http.listen(8008, function() {
	console.log('Server active on port 8008');
});

