(function () {
    var ROUTE = "award"

    App.router.route(ROUTE, ROUTE, function () {
        App.setView(new Abi.View.AwardView())
    })

    /**
     * @class Abi.Model.Award
     * Contains all the logic for fetching the existing awards
     */
    Abi.Model.Award = Backbone.Model.extend({
        urlRoot: "Award/",
        idAttribute: "awardid"
    })
    // Mixin the delaysave
    _.extend(Abi.Model.Award.prototype, Abi.Mixin.DelaySave)
    /**
     * Collects all awards models
     * @class Abi.Collection.Awards
     */
    Abi.Collection.Awards = Backbone.Collection.extend({
        urlRoot: "Award/",
        model: Abi.Model.Award
    })

    Abi.View.AwardView = Backbone.View.extend({
        _subview: ["_autocompletes"],
        initialize: function () {
            this.collection = new Abi.Collection.Awards()
            this.listenTo(this.collection, "reset", this.reset)
                .listenTo(this.collection, "add", this.add)
            this.collection.fetch()
            this._autocompletes = {}
        },
        templateAddForm: function () {
            return "<form action='#' id='createNewAward'>" +
                "<ul class='formList'>" +
                "<li><label for='awardTitle'>Name der neuen Kategorie</label><input type='text' name='awardTitle' id='awardTitle' /></li>" +
                "<li><input type='submit' value='Erstellen' class='btn' /></li>" +
                "</ul>" +
                "</form>";
        },
        templateTableHead: function() {
            return "<thead>" +
                    "<tr>" +
                        "<th>männlich</th>" +
                        "<th>Award</th>" +
                        "<th>Weiblich</th>" +
                    "</tr>" +
                "</thead>"
        },
        templateTable: function () {
            var html = "<table class='table table-bordered table-striped'>"
            html += this.templateTableHead()
            html += "<tbody></tbody>"
            html += "</table>"
            return html
        },
        templateAward: function (model) {
            return "<tr>" +
                    "<td><input type='text' class='maleUser' /></td>" +
                    "<td class='center'>" + model.escape("title") + "</td>" +
                    "<td><input type='text' class='femaleUser' /></td>" +
                "</tr>"
        },
        prepareBody: function () {
            this.$("tbody").empty()
        },
        render: function () {
            this.$el.html(this.templateAddForm()).append(this.templateTable())
            this.prepareBody()
            return this
        },

        // Collection events
        reset: function () {

        },
        add: function () {

        }
    })

})()