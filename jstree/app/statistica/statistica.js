(function () {
    var ROUTE = "statistica"
    App.addNavigationItem(ROUTE, "Auswerten")
    ROUTE += "(/:stats)"
    
    App.router.route(ROUTE, ROUTE, function (stats) {
        steal("jstree/app/statistica/stats.js").then(function () {
            App.StatsRoute(stats)
        })
        
    })
})();