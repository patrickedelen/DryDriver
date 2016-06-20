var _ = require('underscore'),
    R = 6378,
    EQUATOR_DEGREE_KM = (2 * Math.PI * R) / 360;


/**
 * Возвращает уникальные и объединенные боксы для lineString.
 *
 * 1. Расчитывает mainBox из Юго-Западной и Северо-Восточной точек трека.
 * 2. Расширяет mainBox на расстояние fat, чтобы гарантированно соблюдался fat во всех местах трека.
 * 3. Ищем subBoxes - разбиваем mainBox на множество subBoxes с шириной fat.
 * 4. Фильтруем subBoxes, оставляем только те, что пересекают трек. intersectBoxes.
 * 5. Добавляем соседние subBoxes, к каждому из intersectBoxes. necessaryBoxes.
 * 6. Объединяем боксы, чтобы вернуть их как можно меньше.
 *
 * */
function getBoxes(lineString, options, callback) {
    var coordinates = lineString.coordinates;
    var fat = options.fat;

    if (options.reverse) {
        coordinates = reverse(coordinates);
    }

    var mainBox = getMainBox(coordinates);
    extendByFat(mainBox, fat);
    var subBoxes = getSubBoxes(mainBox, fat);
    var intersectBoxes = filterIntersectBoxes(subBoxes, coordinates);
    var necessaryBoxes = getNecessaryBoxes(intersectBoxes, subBoxes);

    return mergeBoxes(necessaryBoxes);
}

function getMainBox(coordinates) {
    var lats = _.map(coordinates, function(item) {return item[0]});
    var lons = _.map(coordinates, function(item) {return item[1]});

    var sw = [_.min(lats), _.min(lons)];
    var ne = [_.max(lats), _.max(lons)];

    return [sw, ne];
}

function extendByFat(box, fat) {
    var sw = box[0], ne = box[1],
        cosCurrentLat = cosd(sw[0]),
        currentLatDegreeKm = cosCurrentLat * EQUATOR_DEGREE_KM,
        fatHeightDegree = fat / EQUATOR_DEGREE_KM,
        fatWidthDegree  = fat / currentLatDegreeKm;

    sw = [sw[0]-fatHeightDegree, sw[1]-fatWidthDegree];
    ne = [ne[0]+fatHeightDegree, ne[1]+fatWidthDegree];

    box[0] = sw; box[1] = ne;
}

function getSubBoxes(box, fat) {
    var sw = box[0], ne = box[1],
        boxWidth = ne[1] - sw[1],
        boxHeight = ne[0] - sw[0],

        cosCurrentLat = cosd(sw[0]),
        currentLatDegreeKm = cosCurrentLat * EQUATOR_DEGREE_KM,

        boxWidthKm = boxWidth * currentLatDegreeKm,
        boxHeightKm = boxHeight * EQUATOR_DEGREE_KM,

        colAmount = Math.floor(boxWidthKm / fat) + 1,
        rowAmount = Math.floor(boxHeightKm / fat) + 1,

        subBoxHeight = fat / EQUATOR_DEGREE_KM,
        subBoxWidth  = fat / currentLatDegreeKm;

    return _.map(_.range(colAmount), function (colIndex) {
        return _.map(_.range(rowAmount), function (rowIndex) {
            var swLat = sw[0], swLon = sw[1],

                verticalOffset = subBoxHeight * rowIndex,
                horisontalOffset = subBoxWidth * colIndex,

                subSwLat = swLat + verticalOffset,
                subSwLon = swLon + horisontalOffset,
                subNeLat = swLat + verticalOffset + subBoxHeight,
                subNeLon = swLon + horisontalOffset + subBoxWidth,

                subSw = [subSwLat, subSwLon],
                subNe = [subNeLat, subNeLon];

            return [subSw, subNe];
        });
    });
}

function filterIntersectBoxes(boxes, coordinates) {
    return _.map(boxes, function (oneLineSubBoxes) {
        return _.filter(oneLineSubBoxes, function (box) {
            return isIntersectOneBox(box, coordinates);
        });
    });
}

function isIntersectOneBox(box, coordinates) {
    var boxSides = [], lineStringSides = [],

        sw = box[0], ne = box[1],
        nw = [sw[0], ne[1]],
        se = [ne[0], sw[1]],

        boxVertexesList = [sw, nw, ne, se];

    for (var i=0; i<boxVertexesList.length; i++) {
        var side = [boxVertexesList[i], boxVertexesList[i+1] || boxVertexesList[0]];
        boxSides.push(side);
    }

    for (var i=0; i<coordinates.length - 1; i++) {
        var side = [coordinates[i], coordinates[i+1]];
        lineStringSides.push(side);
    }

    for (var j=0; j<lineStringSides.length; j++) {
        for (var k=0; k<boxSides.length; k++) {
            if (isIntersectOneSide(boxSides[k], lineStringSides[j])) {
                return true;
            }
        }
    }
}

function isIntersectOneSide(boxSide, lineStringSide) {
    var ax1 = boxSide[0][0],
        ay1 = boxSide[0][1],
        ax2 = boxSide[1][0],
        ay2 = boxSide[1][1],

        bx1 = lineStringSide[0][0],
        by1 = lineStringSide[0][1],
        bx2 = lineStringSide[1][0],
        by2 = lineStringSide[1][1],

        v1 = (bx2-bx1)*(ay1-by1)-(by2-by1)*(ax1-bx1),
        v2 = (bx2-bx1)*(ay2-by1)-(by2-by1)*(ax2-bx1),
        v3 = (ax2-ax1)*(by1-ay1)-(ay2-ay1)*(bx1-ax1),
        v4 = (ax2-ax1)*(by2-ay1)-(ay2-ay1)*(bx2-ax1);

    if ((v1*v2<0) && (v3*v4<0)) return true;
}

function getNecessaryBoxes(intersectBoxes, subBoxes) {
    var necessaryBoxes = [];

    for (var i=0; i<intersectBoxes.length; i++) {
        var oneLineIntersectBoxes = intersectBoxes[i],
            line = subBoxes[i];

        for (var k=0; k<oneLineIntersectBoxes.length; k++) {
            var oneIntersectBox = oneLineIntersectBoxes[k],
                index = [i, line.indexOf(oneIntersectBox)]; // [1,0] строка и колонка в матрице

            necessaryBoxes.push(oneIntersectBox);
            pushSiblingsByIndex(subBoxes, index, necessaryBoxes);
        }
    }

    return _.uniq(necessaryBoxes);
}

function pushSiblingsByIndex(subBoxes, index, necessaryBoxes) {
    var siblings = [];

    siblings.nbox = getOneByIndex(subBoxes, [index[0]+1, index[1]]);
    siblings.nebox = getOneByIndex(subBoxes, [index[0]+1, index[1]+1]);
    siblings.ebox = getOneByIndex(subBoxes, [index[0], index[1]+1]);
    siblings.sebox = getOneByIndex(subBoxes, [index[0]-1, index[1]+1]);
    siblings.sbox = getOneByIndex(subBoxes, [index[0]-1, index[1]]);
    siblings.swbox = getOneByIndex(subBoxes, [index[0]-1, index[1]-1]);
    siblings.wbox = getOneByIndex(subBoxes, [index[0], index[1]-1]);
    siblings.nwbox = getOneByIndex(subBoxes, [index[0]+1, index[1]-1]);

    _.each(Object.keys(siblings), function (key) {
        if (siblings[key]) necessaryBoxes.push(siblings[key]);
    });
}

function getOneByIndex(subBoxes, index) {
    var line, box;
    line = subBoxes[index[0]];
    if (!line) return false;
    box = line[index[1]];
    if (!box) return false;
    return box;
}

function mergeBoxes(necessaryBoxes) {
    return verticalMergeBoxes(necessaryBoxes);
}

function verticalMergeBoxes(boxes) {
    var groupBoxes = {}, keys, mergedBoxes;

    boxes.forEach(function(box) {
        var swLng = box[0][1];

        if (!groupBoxes[swLng]) groupBoxes[swLng] = [];
        groupBoxes[swLng].push(box);
    });

    keys = Object.keys(groupBoxes);
    mergedBoxes = [];

    keys.forEach(function(key) {
        var oneGroup = sortBySwLon(groupBoxes[key]),
            mergedOneGroup = mergeOneVerticalLine(oneGroup);

        mergedOneGroup.forEach(function(box) {
            mergedBoxes.push(box);
        });
    });

    return mergedBoxes;
}

function mergeOneVerticalLine(oneGroup) {
    var subLineList = [], subLine = [];

    // Создает подстрочки из соседних (непрерывных) боксов. После forEach
    // subLineList имеет вид: [ [box, box, box], [subLine], [subLine] ].
    oneGroup.forEach(function(box) {
        if (!subLine.length) {
            subLine.push(box);
        }

        else if ( isVerticalSibling(_.last(subLine), box) ) {
            subLine.push(box);

        } else {
            subLineList.push(subLine);
            subLine = [];
            subLine.push(box);
        }
    });
    subLineList.push(subLine);

    return _.map(subLineList, function(subLine) {
        return _merge(subLine);
    });
}

function isVerticalSibling(box1, box2) {
    var box1NwLat = box1[1][0],
        box2SwLat = box2[0][0],
        diff = Math.abs(box1NwLat - box2SwLat);
    if (diff < 0.001) return true;
}

function sortBySwLon(boxes) {
    return _.sortBy(boxes, function(box) {
        return box[0][0];
    });
}

function _merge(oneGroup) {
    var lats = [], lons = [], maxLat, maxLon, minLat, minLon;

    oneGroup.forEach(function(box) {
        lats.push( box[0][0], box[1][0] );
        lons.push( box[0][1], box[1][1] );
    });

    maxLat = Math.max.apply(Math, lats);
    maxLon = Math.max.apply(Math, lons);

    minLat = Math.min.apply(Math, lats);
    minLon = Math.min.apply(Math, lons);

    return [
        [minLat, minLon],  // sw
        [maxLat, maxLon]   // ne
    ];
}

function reverse(coordinates) {
    return _.map(coordinates, function(coords) {
        return [coords[1], coords[0]];
    });
}

function cosd(degree) {
    return Math.cos( toRadian(degree) );
}

function toRadian(num) {
    return num * Math.PI / 180;
}


module.exports = getBoxes;