# anyboxer
server-side routeboxer


Installation
------------
```sh
npm install anyboxer --save
```

Usage
-----

```js
var anyBoxer = require('anyboxer');

var options = {
    split: false,
    reverse: true
}

anyBoxer(data, options, function(err, boxes) {
    //
});
```

Where **data** has a [FeatureCollection](http://geojson.org/geojson-spec.html#examples) format.

If **split** is ```true``` the result will be divided. Default **split** is ```false```.

If **reverse** is ```true``` then each ```[lat, lon]``` coordinates will become ```[lon, lat]```.

data example
-------

```js
var data = { 
    "type": "FeatureCollection",
    "features": [
        {
           "type": "Feature",
           "geometry": {
               "type": "LineString",
               "coordinates": [ [0,0], [1,1] ] // [ [lat, lon], [lat, lon] ]
           },
           "properties": {
              "fat": 5
           }
        },
    ]
};

```


License
-------
MIT

    
