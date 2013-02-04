(function () {
    // A list of all datas we want to collect
    var ITEMS = window.ITEMS = [{
        category: 1,
        name: "Größe",
        unit: "cm"
    }, {
        category: 2,
        name: "Gewicht",
        unit: "Kilogramm"
    }, {
        category: 3,
        name: "Anzahl Geschwister"
    }, {
        category: 4,
        name: "Zigaretten pro Tag"
    }, {
        category: 5,
        name: "Jungfrau (1 = ja, 0 = nein)"
    }, {
        category: 6,
        name: "Bierkonsum pro Woche",
        unit: "l"
    }, {
        category: 7,
        name: "Kaffekonsum pro Tag",
        unit: "l"
    }, {
        category: 8,
        name: "Schlaf pro Nacht",
        unit: "h"
    }, {
        category: 9,
        name: "TV-Konsum pro Tag",
        unit: "h"
    }, {
        category: 10,
        name: "Online pro Tag",
        unit: "h"
    }, {
        category: 11,
        name: "Fehlstunden pro Woche",
        unit: "h"
    }, {
        category: 12,
        name: "Zuspätkommen pro Woche",
        unit: "min"
    }, {
        category: 13,
        name: "Verweise"
    }, {
        category: 14,
        name: "Arbeit an der Seminararbeit",
        unit: "h"
    }, {
        category: 15,
        name: "Beginn Seminararbeit",
        unit: "Monaten vor Abgabe"
    }, {
        category: 16,
        name: "Schuhgröße"
    }, {
        category: 17,
        name: "Taschengeld pro Monat",
        unit: "€"
    }, {
        category: 18,
        name: "Handy abgenommen bekommen"
    }]


    ITEMS._map = {}
    // Create map of items
    for (var i = 0, len = ITEMS.length; i < len; ++i) {
        ITEMS._map[ITEMS[i].category] = ITEMS[i]
    }
    ITEMS.get = function (c) {
        return ITEMS._map[c]
    }

})()