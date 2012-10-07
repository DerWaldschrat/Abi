(function () {
    var ROUTE = "calendar"
    App.addNavigationItem(ROUTE, "Deine Termine (Klausuren...)")
    App.router.route(ROUTE, ROUTE, function () {
        var CALENDAR = function () {
            App.setView(new Abi.View.CalendarMainView())
        }
        steal("jstree/app/calendar/calendar.main.js").then(function () {
            CALENDAR()
        })
    })
})()