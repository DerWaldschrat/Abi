// At the moment, this is a static file
// Later on it will be editable by a PHP script
window.Plugins = {
    "imagination": {
        js: "js/app/imagination",
        rights: 1,
        route: "imagination(/:image)"
    },
    "alluser": {
        js: "js/app/alluser",
        rights: 1,
        route: "alluser"   
    },
    // For giving rights to users
    "usermanager": {
        js: "js/app/usermanager",
        rights: 2,
        route: "usermanager"
    },
    "calendar": {
        js: "js/app/calendar",
        rights: 1,
        route: "calendar(/:time)"
    },
    // The timetable plugin
    "timetable": {
        js: "js/app/timetable",
        rights: 1,
        route: "timetable"
    },
    "statistica": {
        js: "js/app/statistica",
        rights: 3,
        route: "statistica(/:stats)"
    }
    // Only for testing
    /*"filetester": {
        js: "js/filetester",
        rights: 0,
        route: "filetester"
    }*/   
};