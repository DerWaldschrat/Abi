(function () {
    var ROUTE = "calendar"
    App.addNavigationItem(ROUTE, "Deine Termine (Klausuren...)")
    ROUTE += "(/:time)"
    App.router.route(ROUTE + "(/:time)", ROUTE, function (time) {
        steal("jstree/app/calendar/calendar.main.js").then(function () {
            var options = {}
            if (time && time.split("-").length == 3 && time.length == 10) {
                options.from = new Date(time)
            }
            App.setView(new Abi.View.CalendarMainView(options))
        })
    })
})()