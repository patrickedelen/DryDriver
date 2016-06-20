var _ = require('underscore'),
    pointBoxer = require('./pointBoxer');


/**
 * Возвращает уникальные и объединенные боксы для multiPoint.
 * */
function getBoxes(multiPoint, options) {
    var coordinatesList = multiPoint.coordinates;

    var pointsBoxes = _.map(coordinatesList, function(coordinates) {
        var point = buildPoint(coordinates);
        return pointBoxer(point, options);
    });

    return _.flatten(pointsBoxes, true);
}

function buildPoint(coordinates) {
    return {
        "type": "Point",
        "coordinates": coordinates
    };
}

module.exports = getBoxes;