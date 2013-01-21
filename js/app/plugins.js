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
    }
}
