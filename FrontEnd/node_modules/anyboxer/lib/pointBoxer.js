var _ = require('underscore'),
    R = 6378,
    EQUATOR_DEGREE_KM = (2 * Math.PI * R) / 360;


/**
 * Возвращает уникальные и объединенные боксы для point.
 * */
function getBoxes(point, options) {
    var coordinates = point.coordinates,
        fat = options.fat;

    if (options.reverse) {
        coordinates = reverse(coordinates);
    }

    var pointBox = getPointBox(coordinates, fat);

    return [pointBox];
}

function getPointBox(coordinates, fat) {
    var cosCurrentLat = cosd(coordinates[0]),
        currentLatDegreeKm = cosCurrentLat * EQUATOR_DEGREE_KM,

        fatHeightDegree = fat / EQUATOR_DEGREE_KM,
        fatWidthDegree  = fat / currentLatDegreeKm,

        sw = [coordinates[0]-fatHeightDegree, coordinates[1]-fatWidthDegree],
        ne = [coordinates[0]+fatHeightDegree, coordinates[1]+fatWidthDegree];

    return [sw, ne];
}

function reverse(coordinates) {
    return [coordinates[1], coordinates[0]];
}

function cosd(degree) {
    return Math.cos( toRadian(degree) );
}

function toRadian(num) {
    return num * Math.PI / 180;
}


module.exports = getBoxes;