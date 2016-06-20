var _ = require('underscore'),
    lineStringBoxer = require('./lineStringBoxer');


/**
 * Возвращает уникальные и объединенные боксы для multiLineString.
 * */
function getBoxes(multiLineString, options) {
    var coordinatesList = multiLineString.coordinates;

    var lineStrinsBoxes = _.map(coordinatesList, function(coordinates) {
        var lineString = buildLineString(coordinates);
        return lineStringBoxer(lineString, options);
    });

    return _.flatten(lineStrinsBoxes, true);
}

function buildLineString(coordinates) {
    return {
        "type": "LineString",
        "coordinates": coordinates
    };
}

module.exports = getBoxes;