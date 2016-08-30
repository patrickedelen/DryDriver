  var overlayElem = [];
  var markers = [];
  var routeBoxes = [];

  var startI = 'public/img/start.png';
  var endI = 'public/img/end.png';
  var warningI = 'public/img/warning.png';

  var warningH = 'public/img/warning_historical.png';
  var warningP = 'public/img/warning_police.png';
  var warningU = 'public/img/warning_user.png';

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

    $('#all').click(function(event) {

      $.ajax({
                  type: 'GET',
                  url: '/route/all' //get all events
              })
              .done(function(response) {
                var bounds = new google.maps.LatLngBounds(new google.maps.LatLng(29.7604,-95.3698));
                map.fitBounds(bounds);

                var listener = google.maps.event.addListener(map, "idle", function() { 
                  if (map.getZoom() > 11) map.setZoom(11); 
                  google.maps.event.removeListener(listener); 
                });

                map.overlayMapTypes.setAt(0, null);
                console.log(response);

                var historicalReports = response.historical;
                var policeReports = response.police;
                var userReports = response.user;


                historicalReports.forEach(function(element) {
                  //console.log('lat: ' + parseFloat(element.Coordinates[1]) + ' , lng: ' + parseFloat(element.Coordinates[0]))
                  markers.push(new google.maps.Marker({
                     position: {lat: parseFloat(element.Loc.coordinates[1]), lng: parseFloat(element.Loc.coordinates[0])},
                    title: element.Address,
                    icon: warningH,
                    map: map
                  }));
                });

                policeReports.forEach(function(element) {
                  //console.log('lat: ' + parseFloat(element.Coordinates[1]) + ' , lng: ' + parseFloat(element.Coordinates[0]))
                  markers.push(new google.maps.Marker({
                     position: {lat: parseFloat(element.Loc.coordinates[1]), lng: parseFloat(element.Loc.coordinates[0])},
                    title: element.Address,
                    icon: warningP,
                    map: map
                  }));
                });

                userReports.forEach(function(element) {
                  //console.log('lat: ' + parseFloat(element.Coordinates[1]) + ' , lng: ' + parseFloat(element.Coordinates[0]))
                  markers.push(new google.maps.Marker({
                     position: {lat: parseFloat(element.Loc.coordinates[1]), lng: parseFloat(element.Loc.coordinates[0])},
                    title: element.Address,
                    icon: warningU,
                    map: map
                  }));
                });

            });

    });

    $('#route').click(function(event) {
    
      event.preventDefault();

      if(overlayElem.routePath) {
        overlayElem.routePath.setMap(null);
      }
      if(overlayElem.startMarker) {
        overlayElem.startMarker.setMap(null);
      }
      if(overlayElem.endMarker) {
        overlayElem.endMarker.setMap(null);
      }

      while(markers[0]) {
        markers.pop().setMap(null);
      }
      while(routeBoxes[0]) {
        routeBoxes.pop().setMap(null);
      }

      console.log('Route search started');
      var origin = document.getElementById('c_location').value;
      var destination = document.getElementById('destination').value;

      var form = $( '#form-ajax');

      var formData = $(form).serialize();

       if(origin == '') {
         console.log('Getting current location');

         getLocation(function(position) {
           document.getElementById("c_location").setAttribute('value', position.coords.latitude + "," + position.coords.longitude);  

           origin = document.getElementById('c_location').value;
           destination = document.getElementById('destination').value;

           form = $( '#form-ajax');

           formData = $(form).serialize();

           $.ajax({
                  type: 'POST',
                  url: '/route', //localhost:8008/route for testing, drydriver.pedelen.com/route for prod
                  data: formData
              })
              .done(function(response) {
                map.overlayMapTypes.setAt( 0, null);
                console.log(response);

                var reLine = [];

                response.line.forEach(function(element) {
                  var i = new google.maps.LatLng({
                    'lat': element[1],
                    'lng': element[0]
                  });
                  reLine.push(i);
                });

                //polyline for the route
                overlayElem.routePath = new google.maps.Polyline({
                  path: reLine,
                  geodesic: true,
                  strokeColor: '#2456A5',
                  strokeOpacity: 1.0,
                  strokeWeight: 4
                });

                overlayElem.startMarker = new google.maps.Marker({
                  position: reLine[0],
                  icon: startI,
                  map: map
                });
                overlayElem.endMarker = new google.maps.Marker({
                  position: reLine[reLine.length - 1],
                  icon: endI,
                  map: map
                });

                var historicalReports = response.pins.historical;
                var policeReports = response.pins.police;
                var userReports = response.pins.user;


                historicalReports.forEach(function(element) {
                  //console.log('lat: ' + parseFloat(element.Coordinates[1]) + ' , lng: ' + parseFloat(element.Coordinates[0]))
                  markers.push(new google.maps.Marker({
                     position: {lat: parseFloat(element.Loc.coordinates[1]), lng: parseFloat(element.Loc.coordinates[0])},
                    animation: google.maps.Animation.DROP,
                    title: element.Address,
                    icon: warningH,
                    map: map
                  }));
                });

                policeReports.forEach(function(element) {
                  //console.log('lat: ' + parseFloat(element.Coordinates[1]) + ' , lng: ' + parseFloat(element.Coordinates[0]))
                  markers.push(new google.maps.Marker({
                     position: {lat: parseFloat(element.Loc.coordinates[1]), lng: parseFloat(element.Loc.coordinates[0])},
                    animation: google.maps.Animation.DROP,
                    title: element.Address,
                    icon: warningP,
                    map: map
                  }));
                });

                userReports.forEach(function(element) {
                  //console.log('lat: ' + parseFloat(element.Coordinates[1]) + ' , lng: ' + parseFloat(element.Coordinates[0]))
                  markers.push(new google.maps.Marker({
                     position: {lat: parseFloat(element.Loc.coordinates[1]), lng: parseFloat(element.Loc.coordinates[0])},
                    animation: google.maps.Animation.DROP,
                    title: element.Address,
                    icon: warningU,
                    map: map
                  }));
                });


                overlayElem.routePath.setMap(map);

                var bounds = new google.maps.LatLngBounds();
                for (var i = 0; i < reLine.length; i++) {
                    bounds.extend(reLine[i]);
                }
                console.log(bounds);
                map.fitBounds(bounds);


              });

         });

        
       } else {
       $.ajax({
                  type: 'POST',
                  url: 'http://localhost:8008/route', //localhost:8008/route for testing, drydriver.pedelen.com/route for prod
                  data: formData
              })
              .done(function(response) {
                map.overlayMapTypes.setAt( 0, null);
                console.log(response);

                var reLine = [];

                response.line.forEach(function(element) {
                  var i = new google.maps.LatLng({
                    'lat': element[1],
                    'lng': element[0]
                  });
                  reLine.push(i);
                });

                //polyline for the route
                overlayElem.routePath = new google.maps.Polyline({
                  path: reLine,
                  geodesic: true,
                  strokeColor: '#2456A5',
                  strokeOpacity: 1.0,
                  strokeWeight: 4
                });

                overlayElem.startMarker = new google.maps.Marker({
                  position: reLine[0],
                  icon: startI,
                  map: map
                });
                overlayElem.endMarker = new google.maps.Marker({
                  position: reLine[reLine.length - 1],
                  icon: endI,
                  map: map
                });

                var historicalReports = response.pins.historical;
                var policeReports = response.pins.police;
                var userReports = response.pins.user;


                historicalReports.forEach(function(element) {
                  //console.log('lat: ' + parseFloat(element.Coordinates[1]) + ' , lng: ' + parseFloat(element.Coordinates[0]))
                  markers.push(new google.maps.Marker({
                     position: {lat: parseFloat(element.Loc.coordinates[1]), lng: parseFloat(element.Loc.coordinates[0])},
                    animation: google.maps.Animation.DROP,
                    title: element.Address,
                    icon: warningH,
                    map: map
                  }));
                });

                policeReports.forEach(function(element) {
                  //console.log('lat: ' + parseFloat(element.Coordinates[1]) + ' , lng: ' + parseFloat(element.Coordinates[0]))
                  markers.push(new google.maps.Marker({
                     position: {lat: parseFloat(element.Loc.coordinates[1]), lng: parseFloat(element.Loc.coordinates[0])},
                    animation: google.maps.Animation.DROP,
                    title: element.Address,
                    icon: warningP,
                    map: map
                  }));
                });

                userReports.forEach(function(element) {
                  //console.log('lat: ' + parseFloat(element.Coordinates[1]) + ' , lng: ' + parseFloat(element.Coordinates[0]))
                  markers.push(new google.maps.Marker({
                     position: {lat: parseFloat(element.Loc.coordinates[1]), lng: parseFloat(element.Loc.coordinates[0])},
                    animation: google.maps.Animation.DROP,
                    title: element.Address,
                    icon: warningU,
                    map: map
                  }));
                });


                overlayElem.routePath.setMap(map);

                var bounds = new google.maps.LatLngBounds();
                for (var i = 0; i < reLine.length; i++) {
                    bounds.extend(reLine[i]);
                }
                console.log(bounds);
                map.fitBounds(bounds);


              });
        }
    });


