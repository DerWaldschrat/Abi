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
})
