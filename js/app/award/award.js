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
        events: {
            "focusin input": "createAutocomplete"
        },
        initialize: function () {
            this.collection = new Abi.Collection.Awards()
            this.listenTo(this.collection, "reset", this.reset)
                .listenTo(this.collection, "add", this.add)
            this.collection.fetch()
            this._autocompletes = {}
        },
        // Two opposite functions
        _id: function(model) {
            return "row" + model.cid
        },
        _extract: function (id) {
            return this.collection.get(id.substr(3))
        },
        boolToGender: function (bool) {
            return bool ? "male" : "female"
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
            var male = userList.get(model.get("maleid"))
                , female = userList.get(model.get("femaleid"))
            return "<tr id='" + this._id(model) + "'>" +
                    "<td><input type='text' class='maleUser' data-id='" + model.cid + "' value='" + (male ? male.text : "")+ "' /></td>" +
                    "<td class='center'>" + model.escape("title") + "</td>" +
                    "<td><input type='text' class='femaleUser' data-id='" + model.cid + "' value='" + (female ? female.text : "") + "' /></td>" +
                "</tr>"
        },
        prepareBody: function () {
            var $body = this.$("tbody")
                , html = ""
            for (var i = 0, len = this.collection.length; i < len; i++) {
                html += this.templateAward(this.collection.models[i])
            }
            $body.html(html)
        },
        render: function () {
            this.$el.html(this.templateAddForm()).append(this.templateTable())
            this.prepareBody()
            return this
        },

        // Collection events
        reset: function () {
            this.render()
        },
        add: function () {

        },

        // Events
        // Create autocomplete only when necessary :D, this allows us to have a blasting fast performance
        createAutocomplete: function (event) {
            var el = $(event.currentTarget)
                , male = el.hasClass("maleUser") ? true : false
                , id = el.attr("data-id")
                , hash = this.boolToGender(male) + id
                , model = this.collection.get(id)
                , startid = model.get(this.boolToGender(male) + "id")
            console.log(startid)
            if (!this._autocompletes[hash]) {
                var auto = this._autocompletes[hash] = new Abi.View.AutocompleteUser({
                    collection: male ? userList.maleList : userList.femaleList,
                    el: event.currentTarget,
                    startid: startid,
                    model: model
                })
                auto.value(startid)
                this.listenTo(auto, "selected", male ? this.changeMale : this.changeFemale)
            }
        },
        changeMale: function (id, el, model) {
            model.set("maleid", id);
            model.delaySave(this._delay);
        },
        changeFemale: function (id, el, model) {
            model.set("femaleid", id);
            model.delaySave(this._delay);
        }
    })

})()