/**
 * Created with JetBrains PhpStorm.
 * User: hauke
 * Date: 12.09.12
 * Time: 16:26
 * To change this template use File | Settings | File Templates.
 */
App.user.rights() >= 1 ? function ()  {
    var ROUTE = "timetable"
    App.addNavigationItem(ROUTE, "Deine Fächer")
    App.router.route(ROUTE, ROUTE, function () {
        steal("jstree/app/timetable/timetable.main.js", function () {
            var TIMETABLE = function () {
                App.setView(new Abi.View.Timetable())
            }
            TIMETABLE()
        })
    })
}.call(this) : 0;
