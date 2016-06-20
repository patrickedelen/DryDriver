var _ = require('underscore'),
    async = require('async'),
    lineStringBoxer = require('./lineStringBoxer'),
    multiLineStringBoxer = require('./multiLineStringBoxer'),
    pointBoxer = require('./pointBoxer'),
    multiPointBoxer = require('./multiPointBoxer');


/**
 * @param data {Object} FeatureCollection http://geojson.org/geojson-spec.html#examples}
 * @param options {Object} содержит:
 *      split: {Boolean} если true то разделит результат, иначе объединит.
 *      reverse: {Boolean} если true, то каждую пару координат перевернет [lon, lat] -> [lat, lon].
 * @param callback {Function} {err, boxes}, где:
 *      boxes: массив боксов, если options.split is true, то результат будет разделен.
 *
 * Параметр fat каждого элемента FeatureCollection - жирность, учитывая которую нужно
 * строить боксы. Для Point жирностью является радиус. Для LineString - поля от краев.
 *
 * @example data
 *
 *  { "type": "FeatureCollection",
 *       "features": [
 *           {
 *               "type": "Feature",
 *               "geometry": {
 *                   "type": "LineString",
 *                   "coordinates": [ [0,0], [1,1] ] // [ [lat, lon], [lat, lon] ]
 *               },
 *               "properties": {
 *                  "fat": 5
 *               }
 *           },
 *       ]
 *   };
 *
 * Бокс - прямоугольные границы, выраженные Юго-Западным и Северо-Восточным углами.
 *
 * @example box
 *
 *  sw = [lat, lon] // координаты Юго-Западного угла
 *  ne = [lat, lon] // координаты Северо-Восточного угла
 *  box = [sw, ne]
 *
 * */
function anyBoxer(data, options) {
    var boxes = [],
        reverse = options.reverse,
        features = data.features,
        lineStringsBoxes, multiLineStringsBoxes,
        pointsBoxes, multiPointsBoxes,
        parsedByType;

    validateData(data);

    parsedByType = _.groupBy(data.features, function (num) {return num.geometry.type});

    lineStringsBoxes = getOneTypeBoxes(lineStringBoxer, parsedByType.LineString);
    multiLineStringsBoxes = getOneTypeBoxes(multiLineStringBoxer, parsedByType.MultiLineString);
    pointsBoxes = getOneTypeBoxes(pointBoxer, parsedByType.Point);
    multiPointsBoxes = getOneTypeBoxes(multiPointBoxer, parsedByType.MultiPoint);

    boxes.push(lineStringsBoxes);
    boxes.push(multiLineStringsBoxes);
    boxes.push(pointsBoxes);
    boxes.push(multiPointsBoxes);

    boxes = _.flatten(boxes, true);
    return _.flatten(boxes, true);
}

function getOneTypeBoxes(boxer, features) {
    return _.map(features, function (feature) {
        var one = buildGeoJsonType(feature),
            options = {fat: feature.properties.fat, reverse: true};

        return boxer(one, options);
    });
}

function buildGeoJsonType(feature) {
    return {
        "type": feature.geometry.type,
        "coordinates": feature.geometry.coordinates
    };
}

function validateData(data) {
    var note = 'data type must be a FeatureCollection http://geojson.org/geojson-spec.html#examples';

    if (!_.isObject(data)) {
        throw(note);
    }

    if (data['type'] != "FeatureCollection") {
        console.warn(note);
    }
}


module.exports = anyBoxer;