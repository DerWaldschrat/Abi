/**
 * This is the app file which will be used for the rest of the app excepts from the __faster-object
 */

steal("js/jquery", "js/lodash").then("js/backbone", "js/bootstrap").then(function () {
    /**
     * Some useful Backbone extensions
     */
    // Returns a function which itself returns a singleton of the current class
    Backbone.Singleton = function (defaults) {
        var instance = null
        return function (events, scope, opts) {
            var i, fetch
            opts || (opts = {})
            if (instance === null) {
                instance = new this()
                fetch = true
            }
            events || (events = {})
            for (i in events) {
                scope.listenTo(instance, i, events[i])
            }
            if (fetch) {
                instance.fetch(_.extend({}, defaults || {}, opts))
            }
            return instance;
        }
    }
    // Extend Backbone.Model
    _.extend(Backbone.Model.prototype, {
        // our own url function
        url: function () {
            var base = (getValue(this, "urlRoot") || getValue(this.collection, "url") || urlError()) + (getValue(this, "urlPage") || "index.php");
            if (base.indexOf("http://") === -1) {
                base = ROOT + base;
            }
            var uri = this.isNew() ? base : base + "?" + encodeURIComponent(this.id);
            return uri;
        }
    })
    // Extend Backbone.Collection
    _.extend(Backbone.Collection.prototype, {
        url: function () {
            return ROOT + (_.result(this, "urlRoot") || urlError());
        }
    })
    /**
     * Abi namespace, contains all classes in subnamespaces and the main app object
     * @type {Object}
     */
    var Abi = {
        View: {},
        Model: {},
        Collection: {},
        Mixin: {}
    }

    /**
     * The main router
     */
    Abi.Router = Backbone.Router.extend({
        routes: {
            "ownprofile": "ownprofile",
            "": "ownprofile"
        },
        ownprofile: function ownprofile() {
            // Create main profile
            App.setView(new Abi.View.Profile({
                model: App.user
            }))
        }
    })

    /**
     * Init function, called once after user has loggedin
     */
    function init() {
        this.Messages = Messages
        this.initUserList()
        this.checkWriteMode()
        // Create user
        this.user = new Abi.Model.User(window.__User)
        this.view = null
        this.router = new Abi.Router()
        __faster.closeOverlay()
    }

    /**
     * Checks whether the writemode is enabled or not
     */
    function checkWriteMode () {
        if (window.WRITEMODE !== true) {
            alert(App.message("inReadMode"))
        }
    }

    /**
     * Inits the userlist
     */
    function initUserList() {
        var Abi = window.Abi;
        var userList = new Abi.Collection.LimitedUsers();
        userList.fetch();
        // Actually, we need three user lists: all, male, female
        userList.maleList = new Abi.Collection.LimitedUsers(userList.male());
        userList.femaleList = new Abi.Collection.LimitedUsers(userList.female());
        userList.on("reset", function () {
            userList.maleList.reset(userList.male());
            userList.femaleList.reset(userList.female());
        });
        // This is something we really need, so map it over to the global context
        window.userList = userList;
    }

    /**
     * returns a message
     */
    function message(name) {
        var ret = name;
        if (name.responseText) {
            try {
                ret = JSON.parse(name.responseText).message;
            } catch(e) {}
        }
        return this.Messages[ret] || "Unbekannter Fehler!";
    }

    /**
     * App namespace
     * @type {Object}
     */
    var App = Abi.App = {
        init: init,
        checkWriteMode: checkWriteMode,
        initUserList: initUserList,
        message: message
    }

    // Map over Abi to the global namespace
    window.Abi = Abi
}).then("js/app/user")
