// At the moment, this is a static file
// Later on it will be editable by a PHP script
window.Plugins = {
    "alluser": {
        js: "jstree/app/alluser",
        rights: 1,
        route: "alluser"   
    },
    // For giving rights to users
    "usermanager": {
        js: "jstree/app/usermanager",
        rights: 2,
        route: "usermanager"
    },
    // The Toskana view plugin
    "galeria": {
        js: "jstree/app/galeria",
        rights: 1,
        route: "galeria"
    },
    "calendar": {
        js: "jstree/app/calendar",
        rights: 1,
        route: "calendar(/:time)"
    },
    // The timetable plugin
    "timetable": {
        js: "jstree/app/timetable",
        rights: 1,
        route: "timetable"
    }
    // Only for testing
    /*"filetester": {
        js: "jstree/filetester",
        rights: 0,
        route: "filetester"
    }*/   
};