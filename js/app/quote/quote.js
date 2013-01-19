/**
 * This file contains everything to add, edit, delete and display teacher quotes
 */
(function () {

    var ROUTE = "quote"
    // Change route
    App.router.route(ROUTE, ROUTE, function () {
        App.setView(new Abi.View.QuoteDisplay())
    })

    /**
     * Used for sending in quotes of teachers
     * @class Model.Quote
     */
    Abi.Model.Quote = Backbone.Model.extend({
        fetch: Abi.noop,
        urlRoot: "Quote/",
        idAttribute: "quoteid"
    })

    /**
     * Collection for the corresponding model
     * @class Collection.Quotes
     */
    Abi.Collection.Quotes = Backbone.Collection.extend({
        urlRoot: "Quote/",
        model: Abi.Model.Quote
    }, {
        // Since the quotes are totally belonging to one user, we do not need to refetch the collection all the time
        instance: Backbone.Singleton()
    });

    /**
     * Responsible for plugging everything together
     * @class Abi.View.QuoteDisplay
     */
    Abi.View.QuoteDisplay = Backbone.View.extend({
        _subview: ["quoteList"],
        events: {
            "submit form": "submit"
        },
        initialize: function () {
            this.quoteList = new Abi.View.QuoteList()
            this.collection = this.quoteList.collection
            // Create model which we can operate on
            this.newModel()
        },
        templateForm: function () {
            return "<form action='#'>" +
                    "<fieldset>" +
                        "<legend>Einen Spruch eintragen</legend>" +
                        "<label for='quoteContent'>Dein Spruch</label><textarea id='qContent'></textarea>" +
                    "</fieldset>" +
                    "<fieldset class='buttonAndMessage control-group'>"+
                        "<input type='submit' value='Eintragen' class='btn' />" +
                    "<div class='statusField help-block'></div>" +
                    "</fieldset>" +
                "</form>"
        },
        render: function () {
            this.$el.html(this.templateForm())
                .append(this.quoteList.render().el)
            return this
        },
        // Create new model with right id set
        newModel: function() {
            this.model = new Abi.Model.Quote({
                userid: App.user.id
            });
            this.listenTo(this.model, "error", this.error).listenTo(this.model, "sync", this.sync)
        },
        // Events
        error: function (quote, error) {
            this.message(error)
        },
        sync: function () {
            this.$("#quoteContent").val("")
            this.message("quoteSaveSucceed", true)
            // Now we do not need to listen to this model any more
            this.stopListening(this.model)
            // Add to collection
            this.collection.add(this.model)
            // Setup new model again
            this.newModel()
        },
        submit: function (event) {
            event.preventDefault()
            this.clearMessage()
            // Save model
            this.model.save({
                content: this.$("#qContent").val()
            })
        }
    })

    Abi.View.QuoteList = Backbone.View.extend({
        tagName: "ul",
        id: "quoteList",
        events: {
            "click .removeButton": "removeItem"
        },
        initialize: function () {
            this.collection = Abi.Collection.Quotes.instance({
                reset: this.render,
                remove: this.destroyItem,
                add: this.addItem
            }, this)
        },
        templateQuote: function(quote) {
            return "<li id='" + this._idFromQuote(quote) + "'><i class='removeButton icon-trash' title='Spruch löschen' data-id='" + quote.cid + "'></i>" + quote.escape("content") + "</li>";
        },
        _idFromQuote: function (quote) {
            return "quote" + quote.cid
        },
        render: function () {
            this.$el.html(this.getList())
            return this
        },
        getList: function () {
            var html = ""
            for (var i = 0, len = this.collection.length; i < len; i++) {
                html += this.templateQuote(this.collection.models[i])
            }
            return html
        },
        // Remove item
        removeItem: function (event) {
            var $target = $(event.currentTarget)
                , id = $target.attr("data-id")
                , quote = this.collection.get(id)
            quote.destroy()
        },
        // Removes item from dom
        destroyItem: function (quote) {
            this.$("#" + this._idFromQuote(quote)).remove()
        },
        // Adds item to dom
        addItem: function (quote) {
            this.$el.append(this.templateQuote(quote))
        }
    })
})()
