  var loc = document.getElementById("c_location");
  var map;

  function getLocation() {
      if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(showPosition, showError);
      } else { 
          loc.value = "Geolocation is not supported by this browser.";
      }
  }

  function showPosition(position) {
      //alert(position.coords.latitude);
      // loc.value = "works";
      document.getElementById("c_location").setAttribute('value', position.coords.latitude + 
      "," + position.coords.longitude);  
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
  function initialize() {
    var mapProp = {
      center:new google.maps.LatLng(29.7604,-95.3698),
      zoom:12,
      mapTypeControl: false,
      scaleControl: true,
      streetViewControl: false,
      zoomControl: true,
      zoomControlOptions: {
        position: google.maps.ControlPosition.LEFT_CENTER
      },
      mapTypeId:google.maps.MapTypeId.ROADMAP
    };
    map=new google.maps.Map(document.getElementById("googleMap"), mapProp);

    $('#continue').click(function() {
        $('#googleMap_container').removeClass('blurred');
        $('#infoModal').addClass('hidden');
    });
  }
  google.maps.event.addDomListener(window, 'load', initialize);

