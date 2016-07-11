  var overlayElem = [];
  var markers = [];
  var routeBoxes = [];

  var startI = 'public/img/start.png';
  var endI = 'public/img/end.png';
  var warningI = 'public/img/warning.png';

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

      console.log('click');
      var origin = document.getElementById('c_location').value;
      var destination = document.getElementById('destination').value;

      var form = $( '#form-ajax');

      var formData = $(form).serialize();

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

                response.pins.forEach(function(element) {
                  //console.log('lat: ' + parseFloat(element.Coordinates[1]) + ' , lng: ' + parseFloat(element.Coordinates[0]))
                  markers.push(new google.maps.Marker({
                     position: {lat: parseFloat(element.Loc.coordinates[1]), lng: parseFloat(element.Loc.coordinates[0])},
                    animation: google.maps.Animation.DROP,
                    title: element.Address,
                    icon: warningI,
                    map: map
                  }));
                });

                // response.boxes.forEach(function(element, index) {
                //   console.log('Adding box');
                //   console.log(element);
                //   polyBox = [];
                //   element.forEach(function(elem) {
                //     var z = {
                //     'lat': parseFloat(elem[1]),
                //     'lng': parseFloat(elem[0])
                //     };
                //     polyBox.push(z);
                //   });
                //   console.log(polyBox);

                //   routeBoxes.push(new google.maps.Polygon({
                //       paths: polyBox,
                //       strokeColor: '#000000',
                //       strokeOpacity: 0.8,
                //       strokeWeight: 2,
                //       fillColor: '#000000',
                //       fillOpacity: 0.35
                //     }));
                //     routeBoxes[index].setMap(map);
                // });


                // if(response.boxes.length === 0) {
                //   alert('Search along route failed...Maybe try a different route?');
                //   console.log('Search along route failed...Maybe try a different route?');
                // }

                overlayElem.routePath.setMap(map);

                var bounds = new google.maps.LatLngBounds();
                for (var i = 0; i < reLine.length; i++) {
                    bounds.extend(reLine[i]);
                }
                console.log(bounds);
                map.fitBounds(bounds);


              });
    });


