//Stores locations of users and alerts users when an alert/incident happens near their location

//in the future, report incidents to http://311selfservice.houstontx.gov/Ef3/General.jsp?form=PWE_Street_WEB&page=SSP_Page_EmailEnter
var io = require('socket.io')(http);

io.on('connection', function(socket){
  console.log('user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
  socket.on('Alert reported', function(msg){
    io.emit('chat message', msg);
  });
});
