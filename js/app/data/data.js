steal("js/app/data/items.js").then(function () {
    var ROUTE = "data"
    App.router.route(ROUTE, ROUTE, function () {
        App.setView(new Abi.View.Data())
    })

    Abi.Model.Data = Backbone.Model.extend({
        urlRoot: "Data/",
        idAttribute: "dataid"
    })
    // We need the delaySave again
    _.extend(Abi.Model.Data.prototype, Abi.Mixin.DelaySave)

    Abi.Collection.Datas = Backbone.Collection.extend({
        model: Abi.Model.Data,
        urlRoot: "Data/",
        byC: function (c) {
            return this._categories && this._categories[c]
        },
        // Overwrite add to create a map of the categories
        add: function (model, options) {
            var ret = Backbone.Collection.prototype.add.call(this, model, options)
            var models = this.models
            this._categories || (this._categories = {})
            for (var i = 0, len = models.length, curr; i < len; ++i) {
                curr = models[i]
                this._categories[curr.get("categoryid")] = curr
            }
            return ret
        },
        // Overwrite reset to reset categories hash
        reset: function (a,b) {
            this._categories = {}
            return Backbone.Collection.prototype.reset.call(this, a, b)
        }
    }, {
        instance: Backbone.Singleton()
    })

    // Used to beautify our value
    function parseValue(val) {
        return val.replace(",", ".").replace(/[^0-9.]+/g, "").replace()
    }

    Abi.View.Data = Backbone.View.extend({
        events: {
            "change input": "save"
        },
        initialize: function () {
            this.collection = Abi.Collection.Datas.instance({
                reset: this.replaceBody
            }, this)
        },
        templateHead: function () {
            return "<h1>Ein paar Daten zu dir</h1>"
            + "<div class='alert alert-info'>" +
                    "<h4>Beachte:</h4>" +
                    " Diese Daten benötigen wir lediglich, um die Kategorien Minimal-, Maximal- und Durchschnittsabiturient(in) zu erstellen, sie werden also selbstverständlich" +
                " nicht unter deinem Namen einfach so veröffentlich!" +
                "</div>" +
                "<div id='dataBody'></div>"
        },
        templateForm: function () {
            var html = "<form action='#' class=''>" +
                "<fieldset>" +
                    "<legend>Die Daten</legend>"
            for (var i = 0, len = ITEMS.length, curr, item, value; i < len; ++i) {
                curr = ITEMS[i]
                item = this.collection.byC(curr.category)
                value = item ? item.escape("value") : ""
                html += this.templateItem(curr, value)
            }
            html += "</fieldset>" +
                "</form>"
            return html
        },
        templateItem: function (item, value) {
            var title = item.name + (item.unit ? " in " + item.unit : "")
                , html = "<label>" +
                "<input type='text' value='" + value + "' data-category='" + item.category + "' title='" + title + "' maxlength='15' /> " +
                title +
                "</label>"
            return html
        },
        render: function () {
            this.$el.html(this.templateHead())
            this.replaceBody()
            return this
        },
        replaceBody: function () {
            this.$("#dataBody").html(this.templateForm())
        },
        save: function (event) {
            var $target = $(event.currentTarget)
                , category = $target.attr("data-category")
                , model = this.collection.byC(category) || new Abi.Model.Data()
            if (model.isNew()) {
                model.set("categoryid", category)
                this.listenTo(model, "sync", this.addModel)
                    .listenTo(model, "error", this.removeListen)
                    .listenTo(model, "clearSave", this.removeListen)
            }
            var value = parseValue($target.val())
            $target.val(value)
            model.delaySave(1000, {
                value: value
            })
        },
        removeListen: function (model) {
            this.stopListening(model)
            this.collection.add(model)
        },
        addModel: function (model) {
            this.removeListen(model)
        }
    })

})