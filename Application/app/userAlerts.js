//Stores locations of users and alerts users when an alert/incident happens near their location
var io = require('socket.io')(http);

io.on('connection', function(socket){
  console.log('user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
});
