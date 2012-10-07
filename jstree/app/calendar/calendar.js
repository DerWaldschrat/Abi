(function () {
    var ROUTE = "calendar"
    App.addNavigationItem(ROUTE, "Deine Termine (Klausuren...)")
    App.router.route(ROUTE, ROUTE, function () {
        steal("jstree/app/calendar/calendar.main.js").then(function () {
            App.setView(new Abi.View.CalendarMainView())
        })
    })
})()