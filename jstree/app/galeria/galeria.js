App.user.rights() >= 1 ? function () {
    // Only load all the libs if necessary
    var ROUTE = "galeria"
    App.addNavigationItem(ROUTE, "Galerie")
    App.router.route(ROUTE, ROUTE, function () {
        steal("jstree/app/galeria/main.js").then(function () {
            App.setView(new Abi.View.Galeria())    
        })
    })


}.call(this) : 0;