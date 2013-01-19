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
            var base = (_.result(this, "urlRoot") || _.result(this.collection, "url") || urlError()) + (_.result(this, "urlPage") || "index.php");
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
    // Extend Backbone.View
    _.extend(Backbone.View.prototype, {
        message: function (name, green) {
            this.clearMessage();
            this.$el.find(".buttonAndMessage").addClass(green ? "success" : "error")
                .find(".statusField").text(Abi.App.message(name))
        },
        clearMessage: function () {
            this.$el.find(".buttonAndMessage").removeClass("success error").find(".statusField").text("");
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
        // Find main dom element
        this.$main = $("#content");
        __faster.closeOverlay()

        // Start history
        Backbone.history.start()
        return this
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
     * Sets the app view to the given one
     */
    function setView(view) {
        var old = this.view
        if (old instanceof Backbone.View) {
            // Just hide view
            old.$el.css("display", "none")
        }
        this.view = view
        this.$main.append(view.render().el)
        if (old instanceof Backbone.View) {
            old.remove()
        }
    }

    /**
     * App namespace
     * @type {Object}
     */
    var App = Abi.App = {
        init: init,
        checkWriteMode: checkWriteMode,
        initUserList: initUserList,
        message: message,
        setView: setView
    }

    // Map over Abi to the global namespace
    window.Abi = Abi
}).then("js/app/user", "js/jquery/ui", "js/jquery/ui/ui.css").then("js/jquery/ui/localize.js").then(function () {
    __faster.unlockPageLoad()
})
