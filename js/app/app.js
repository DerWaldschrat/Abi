/**
 * This is the app file which will be used for the rest of the app excepts from the __faster-object
 */

steal("js/jquery", "js/lodash").then("js/backbone", "js/bootstrap", "js/app/messages.js").then(function () {
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
    // Therefore we have to cache the remove function since it is overriden
    var _remove = Backbone.View.prototype.remove
    _.extend(Backbone.View.prototype, {
        message: function (name, green) {
            this.clearMessage();
            this.$el.find(".buttonAndMessage").addClass(green ? "success" : "error")
                .find(".statusField").text(Abi.App.message(name))
        },
        clearMessage: function () {
            this.$el.find(".buttonAndMessage").removeClass("success error").find(".statusField").text("");
        },
        // Overwrite for complete cleanup!
        remove: function () {
            if (typeof this._subview !== "undefined") {
                for (var i = 0, len = this._subview.length, curr; i < len; i++) {
                    curr = this[this._subview[i]]
                    // Is it a list of views?
                    if (curr == null) continue;
                    if (!(curr instanceof Backbone.View)) {
                        var j
                        for (j in curr) {
                            curr[j] !== null && typeof curr[j].remove === "function" && curr[j].remove();
                        }
                    } else {
                        curr !== null && typeof curr.remove === "function" && curr.remove();
                    }
                }
            }
            // Call original method
            return _remove.apply(this, arguments);
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
    * @abstract Mixin.DelaySave
    * Useful for models when you acually want to delay the saving a bit
    */
    Abi.Mixin.DelaySave = {
        delaySave: function (delay, props, options) {
            var self = this;
            if (this._ii) {
                window.clearInterval(this._ii);
                this.trigger("clearSave", this)
            }
            this._ii = window.setTimeout(function() {
                self.save(props, options)
            }, delay)
        }
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
        this.$main = $("#content")
        // Create head view
        this.headView = new Abi.View.HeadView({
            el: document.getElementById("head")
        });
        // Setup navigation
        this.setupNavigation()
        __faster.closeOverlay()
        // Trigger finishload, plugins have to be initialized
        this.trigger("finishload")
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
     * Sets up the navigation, including event delegation and adding the first item
     */
    function setupNavigation() {
        this.$navi = $("#navi")
        // Trigger route instead of navigating through the link
        this.$navi.on("click", "a", function(event) {
            event.preventDefault()
            var $target = $(event.currentTarget)
            App.router.navigate($target.attr("href"), {
                trigger: true
            })
        })
        // Make it stay at the top
        this.$navi.affix()
        // Add first item, the ownprofile
        this.createNavigationItem("ownprofile", "Dein Profil")
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
     * Creates navigation item
     * */
    function createNavigationItem(route, name) {
        this.$navi.append('<li><a href="' + _.escape(route) + '">' + _.escape(name) + '</a></li>')
    }

    /**
     * Logs the user out
     */
    function logout() {
        location.href = ROOT + "User/logout.php"
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
        setView: setView,
        setupNavigation: setupNavigation,
        createNavigationItem: createNavigationItem,
        logout: logout
    }
    // Make it possible to fire events
    _.extend(App, Backbone.Events)

    // Map over Abi to the global namespace
    window.Abi = Abi
}).then("js/jquery/ui", "js/jquery/ui/ui.css", "js/app/plugins.js").then("js/jquery/ui/localize.js", "js/app/user").then(function () {
    // Init all plugins on finishload
    Abi.App.on("finishload", function () {
        var rights = Abi.App.user.rights(), curr, routes = {}
        for (var i in Plugins) {
            curr = Plugins[i]
            // Add navigation item if existent
            if (curr.nav) {
                Abi.App.createNavigationItem(curr.nav.route, curr.nav.name)
            }
            // We have to create a closure for that
            (function (i, curr) {
                if (rights >= curr.rights) {
                    // If loading of a plugin fails
                    try {
                        // Set up the lazyloading
                        // For the trick see app.explain.txt
                        routes[i] = false
                        Abi.App.router.route(curr.route, i, function () {
                            routes[i] = true
                        })
                        steal(curr.js).then(function () {
                            // Triggered plugin, so we need to restart history
                            if (routes[i]) {
                                Backbone.history.stop()
                                Backbone.history.start()
                            }
                        })
                    } catch(e) {}
                }
            })(i, curr)
        }
    })
    __faster.unlockPageLoad()
})
