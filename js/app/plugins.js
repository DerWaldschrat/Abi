/**
 * List of all plugins
 * Definition looks like this:
 * key: name
 * value:
 *      js: js file to load
 *      rights: rights required to load this plugin
 *      route: route to set in the router
 *      nav: undefined |
 *          route: route to add to the navigation
 *          name: text to display
 *
 *
 */
window.Plugins = {
    "profile": {
        js: "js/app/profile",
        rights: 1,
        route: "profile/:id"
    },
    "quote": {
        js: "js/app/quote",
        rights: 0,
        route: "quote",
        nav: {
            route: "quote",
            name: "Füge einen Lehrerspruch hinzu"
        }
    },
    "yourcomments": {
        js: "js/app/yourcomments",
        rights: 0,
        route: "yourcomments",
        nav: {
            route: "yourcomments",
            name: "Andere über dich"
        }
    },
    "posted": {
        js: "js/app/posted",
        rights: 1,
        route: "posted",
        nav: {
            route: "posted",
            name: "Du über andere"
        }
    },
    "award": {
        js: "js/app/award",
        rights: 1,
        route: "award",
        nav: {
            route: "award",
            name: "Die Abi-Awards"
        }
    },
    "imagination": {
        js: "js/app/imagination",
        rights: 1,
        route: "imagination(/:image)",
        nav: {
            route: "imagination",
            name: "Bilder hochladen"
        }
    },
    "alluser": {
        js: "js/app/alluser",
        rights: 1,
        route: "alluser",
        nav: {
            route: "alluser",
            name: "Alle User anzeigen"
        }
    },
    "usermanager": {
        js: "js/app/usermanager",
        rights: 2,
        route: "usermanager",
        nav: {
            route: "usermanager",
            name: "User freischalten"
        }
    },
    "statistica": {
        js: "js/app/statistica",
        rights: 3,
        route: "statistica(/:stats)",
        nav: {
            route: "statistica",
            name: "Auswerten"
        }
    }
}
