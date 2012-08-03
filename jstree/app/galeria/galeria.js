App.user.galeria() === true ? function () {
    // Only load all the libs if necessary
    var ROUTE = "galeria"
    App.addNavigationItem(ROUTE, "Galerie")
    App.router.route(ROUTE, ROUTE, function () {
        steal("jstree/app/galeria/main.js").then(function () {
            var GALERIA = function () {
                App.setView(new Abi.View.Galeria())   
            }
            GALERIA()
        })
    })


}.call(this) : 0;