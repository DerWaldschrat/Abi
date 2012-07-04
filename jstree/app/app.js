/**
 * This is the app file which will be used for the rest of the app excepts from the __faster-object
 */
steal("jstree/jquery", "jstree/underscore").then("jstree/backbone", "jstree/bootstrap").then("jstree/backbone/bindTo").then(function () {
    var getValue = function(object, prop) {
        if (!(object && object[prop])) return null;
        return _.isFunction(object[prop]) ? object[prop]() : object[prop];
    },  // Throw an error when a URL is needed, and none is supplied.
    urlError = function() {
        throw new Error('An "url" property or function must be specified');
    },
    noop = function () {

    },
    // The namespace containing all the functionality for this app
    Abi = {
        Model: {

        },
        Collection: {

        },
        Router: {

        },
        View: {

        },
        Mixin: {

        }
    };
    // Make the Abi able to look for events
    _.extend(Abi, Backbone.Events);
    /**
     * @class Model.Base
     * Used as a base class instead of Backbone.Model because of the different url handling
     */
    Abi.Model.Base = Backbone.Model.extend({
        url: function () {
            var base = (getValue(this.collection, "url") || getValue(this, "urlRoot") || urlError()) + (getValue(this, "urlPage") || "index.php");
            if (base.indexOf("http://") === -1) {
                base = ROOT + base;
            }
            var uri = this.isNew() ? base : base + "?" + encodeURIComponent(this.id);
            return uri;
        }
    });
    /**
     * @class Model.User
     * Do not allow fetching data for the user, this is only allowed at the loading of the page.
     * It is also not allowed to destroy the user for obvious reasons
     */
    Abi.Model.User = Abi.Model.Base.extend({
        fetch: noop,
        destroy: noop,
        // The idAttribute needs to be changed here
        idAttribute: "userid",
        urlRoot: "User/",
        // Direct access to the rights property
        rights: function () {
            return this.get("rights");
        }
    });

    /**
     * @class Collection.Base
     * At the moment a noop, but we dont know, maybe we will need this later
     */
    Abi.Collection.Base = Backbone.Collection.extend({
        // Behaves like a fetch with adding, but empties the collection first
        refetch: function (op) {
            var options = op || {};
            options.add = true;
            return this.reset([], {silent: true}).fetch(options);
        },
        url: function () {
            return ROOT + (getValue(this, "urlRoot") || urlError());
        }
    });

    /**
     * @class Router.Base
     * The app`s router
     */
    Abi.Router.Base = Backbone.Router.extend({
        routes: {
            "ownprofile": "ownprofile",
            "profile/:name": "profile",
            "award": "award",
            "quote": "quote",
            "yourcomments": "yourcomments",
            "": "ownprofile"
        },
        ownprofile: function () {
            Abi.App.setView(new Abi.View.Profile({
                model: Abi.App.user
            }))
        },
        profile: function (id) {
            if (id  < 0) {
                alert("User nicht gefunden!");
                // TODO: Better way of handling this
            } else if (id == Abi.App.user.id) {
                Abi.App.router.navigate("ownprofile", {trigger: true});
            } else  {
                var view = new Abi.View.UserProfile({
                    collection: userList,
                    modelId: id
                });
                Abi.App.setView(view)
            }
        },
        award: function(name) {
            Abi.App.setView(new Abi.View.Award());
        },
        quote: function () {
            Abi.App.setView(new Abi.View.Quote());
        },
        yourcomments: function () {
            Abi.App.setView(new Abi.View.Comments());
        }
    });

    /**
     * @class View.Base
     * Includes the messaging function for view, maybe never used, but very useful
     */
    Abi.View.Base = Backbone.View.extend({
        message: function (name, green) {
            this.clearMessage();
            this.$el.find(".buttonAndMessage").addClass(green ? "success" : "error")
            .find(".statusField").text(Abi.App.message(name))
            this.$el.find("[type=submit]").addClass(green ? "btn-success" : "btn-error")
        },
        clearMessage: function () {
            this.$el.find(".buttonAndMessage").removeClass("success error").find(".statusField").text("");
            this.$el.find("[type=submit]").removeClass("btn-success btn-danger");    
        },
        // Overwrite for complete cleanup!
        remove: function () {
            if (typeof this._subviewList !== "undefined") {
                for (var i = 0, len = this._subviewList.length, curr; i < len; i++) {
                    curr = this[this._subviewList[i]];
                    // Is it a list of views?
                    if (curr == null) continue;
                    if (!(curr instanceof Abi.View.Base)) {
                        var j;
                        for (j in curr) {
                            console.log(curr[j]);
                            curr[j].remove();
                        }
                    } else {
                        curr.remove();
                    }
                }
            }
            // Call original method
            return Backbone.View.prototype.remove.apply(this, arguments);
        },
        // Sets names of subviews to remove
        setSubviewStore: function () {
            this._subviewList || (this._subviewList = []);
            for (var i = 0, len = arguments.length; i < len; i++) {
                this._subviewList.push(arguments[i]);
            }
        }
    });

    /**
     * @class View.NavigationItem
     * Used for displaying the navigation
     */
    Abi.View.NavigationItem = Abi.View.Base.extend({
        tagName: "li",
        initialize: function (options) {
            this.link = options.link;
            this.text = options.text;
        },
        render: function () {
            this.$el.html("<a href='#" + this.link + "'>" + this.text + "</a>");
            return this;
        },
        change: function(o) {
            var changed = false;
            if (o.link) {
                changed = true;
                this.link = o.link;
            }
            if (o.text) {
                changed = true;
                this.text = o.text;
            }
            return changed === true ? this.render() : this;
        },
        toggleActive: function () {
            this.$el.toggleClass("active");
        }
    });

    /**
     * @object App
     * Contains the whole instantiation progress of the page
     */
    Abi.App = {
        pageRoot: "design/",
        defaultPage: "ownprofile"
    };
    // Mixin the events hash
    _.extend(Abi.App, Backbone.Events);
    Abi.App.init = function () {
        this.initUserLists();
        // close the overlay
        __faster.closeOverlay();
        // Take the loading button
        this.$loading = $loading;
        // Create the user instance
        this.user = new Abi.Model.User(window.__User);
        // The active view
        this.view = null;
        // Map over messages
        this.Messages = Messages;
        // Find main dom element
        this.$main = $("#content");
        // Find navigation dom element
        this.$navigation = $("#navi");
        // Responsible for the head of the page
        this.headView = new Abi.View.HeadView({
            el: document.getElementById("head")
        });
        // create basic router
        this.router = new Abi.Router.Base();
        this.on("__history", function () {
            Backbone.history.start();
        })
        // delete the raw user data
        delete window.__User;
        // delete the faster object
        delete __faster;
        // Delete this cache
        delete __simpleCache;
        // Delete the loading button
        delete $loading;
        // Init history just after plugins having been loaded
        return this.initNavigation().trigger("finishload").trigger("__history");
    };
    Abi.App.initNavigation = function () {
        this.navigation = {};
        // Map of links, link´s names and required rights
        var inits = {
            "ownprofile": ["Dein Profil", 0],
            "award": ["Die Abi-Awards", 1],
            "quote": ["Füge einen Lehrerspruch hinzu", 1],
            "yourcomments": ["Andere über dich", 0]

        }, i, r = this.user.rights();
        for (i in inits) {
            if(inits[i][1] <= r) 
            this.addNavigationItem(i, inits[i][0]);
        }
        return this;
    };

    Abi.App.initUserLists = function () {
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
    };

    Abi.App.getValue = getValue;
    Abi.App.urlError = urlError;
    Abi.App.noop = noop;
    Abi.App.message = function (name) {
        var ret = name;
        if (name.responseText) {
            try {
                ret = JSON.parse(name.responseText).message;
            } catch(e) {
            }
        }
        return this.Messages[ret] || "Unbekannter Fehler!";
    };
    Abi.App.addMessage = function (name, value) {
        this.Messages[name] = value;
    };
    Abi.App.addView = function(name, view) {
        this.views[name] = view;
        return view;
    };
    Abi.App.view = function(name) {
        return this.views[name];
    };
    Abi.App.getLoading = function() {
        return this.$loading.cloneNode(true);
    };

    Abi.App.reset = function() {
        this.$main.contents().detach();
        this.$main.trigger("cleanuppage");
        return this.$main;
    };

    Abi.App.addNavigationItem = function (link, text) {
        var link = this.navigation[link] = new Abi.View.NavigationItem({
            link: link,
            text: text
        }).render();
        this.$navigation.append(link.$el);
        return this;
    };
    
    // For the logout    
    Abi.App.logout = function () {
        location.href = ROOT + "User/logout.php";
    }
    
    // Sets a view to the main page
    Abi.App.setView = function(view) {
        if (this.view instanceof Backbone.View) {
            this.view.remove();
        }
        this.view = view;
        this.$main.append(view.render().el);      
    }

    /*
     * A very interesting, but short API:
     * The backgroundProcess API
     * It can be called for savings which are not obvious to the user, but also need to be done to prevent the user from leaving the page
     */
    _.extend(Abi.App, (function () {
        var _calls = 0,
            retain = function () {
                _calls++;
        },
            release = function () {
                _calls--;
        };
        $(window).on("beforeunload", function () {
            if(_calls > 0) {
                return false;
            }
        });
        return {
            retainBackgroundProcess: retain,
            releaseBackgroundProcess: release
        }
    })());

    window.Abi = Abi;
}).then("jstree/app/models", "jstree/app/fileupload").then("jstree/jquery/ui", "jstree/jquery/ui/ui.css").then("jstree/app/views", "jstree/app/messages", "jstree/jquery/ui/localize.js")
// The plugins to be loaded
// Actually, this is quite simple: A static list of activated plugins is loaded (it can be static or dynamic), 
// and if the user has the right to use this plugin, it is loaded (on the server side, the right needs to be controlled, too)
.then("jstree/plugins").then(function () {
    Abi.App.on("finishload", function () {
        var rights = Abi.App.user.rights(), curr, routes = {};
        for (var i in Plugins) {
            curr = Plugins[i];
            if (rights >= curr.rights) {
                // If loading of a plugin fails
                try {
                    // Set up the lazyloading
                    // For the trick see app.explain.txt
                    routes[i] = false;
                    Abi.App.router.route(curr.route, i, function () {
                        routes[i] = true;   
                    });
                    steal(curr.js).then(function () {
                        // Triggered plugin, so we need to restart history
                        if (routes[i]) {
                            Backbone.history.stop();
                            Backbone.history.start();    
                        }
                    });    
                } catch(e) {
                    
                }
            }   
        }
    });
    
    // Finish loading
    __faster.unlockPageLoad();
}).then("jstree/special/special.css").then("jstree/special");