function getLocation(cb) {
      if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(cb, showError);
      } else { 
          loc.value = "Geolocation is not supported by this browser.";
      }
  }

  function showError(error) {
      switch(error.code) {
          case error.PERMISSION_DENIED:
              loc.value = "User denied the request for Geolocation."
              break;
          case error.POSITION_UNAVAILABLE:
              loc.value = "Location information is unavailable."
              break;
          case error.TIMEOUT:
              loc.value = "The request to get user location timed out."
              break;
          case error.UNKNOWN_ERROR:
              loc.value = "An unknown error occurred."
              break;
      }
  }

  var warningU = 'public/img/warning_user.png';

var socket = io();

$('#report').click(function() {
      getLocation(function(position) {

        var alert = {
            latitude : position.coords.latitude,
            longitude : position.coords.longitude
        };
         console.log(alert);
         socket.emit('report', alert);
         console.log('Reported location');
      });
    });

socket.on('new report', function(alert){
    new google.maps.Marker({
        position: {lat: alert.latitude, lng: alert.longitude},
        animation: google.maps.Animation.DROP,
        title: 'User reported location',
        icon: warningU,
        map: map
    });
  });