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
            "focusin input": "createAutocomplete",
            "submit #createNewAward": "createNewAward",
            "click .deleteAwardItem": "deleteAward"
        },
        initialize: function () {
            this.collection = new Abi.Collection.Awards()
            this.listenTo(this.collection, "reset", this.reset)
                .listenTo(this.collection, "add", this.add)
                .listenTo(this.collection, "remove", this.destroy)
            this.collection.fetch()
            this._autocompletes = {}
            // Delay for saving the models
            this._delay = 1000
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
                , removeIfAllowed = App.user.rights() >= 3 ? "<span class='close deleteAwardItem' data-delete='" + model.cid + "' title='Award löschen'>&times;</span>" : ""
            return "<tr id='" + this._id(model) + "'>" +
                    "<td><input type='text' class='maleUser' data-id='" + model.cid + "' value='" + (male ? male.text : "")+ "' /></td>" +
                    "<td class='center'>" + model.escape("title") + removeIfAllowed + "</td>" +
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
        // Because of the event delegation and the lazyloading of the autocomplete, adding rows is blasting simple
        add: function (model) {
            this.$("tbody").append(this.templateAward(model))
        },
        destroy: function (model) {
            var $row = $("#" + this._id(model))
                , mHash = this.boolToGender(true) + model.cid
                , fHash = this.boolToGender(false) + model.cid
            if (this._autocompletes[mHash]) {
                console.log("remove auto")
                this._autocompletes[mHash].remove()
            }
            if (this._autocompletes[fHash]) {
                this._autocompletes[fHash].remove()
            }
            $row.remove()
            this.stopListening(model)
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
        },
        // Create new award
        createNewAward: function (event) {
            event.preventDefault()
            var $title = this.$("#awardTitle"), model = new Abi.Model.Award({
                title: $title.val(),
                userid: Abi.App.user.id
            })
                , self = this
            $title.val("")
            // On sync, add to this collection
            model.on("sync", function () {
                model.off()
                self.collection.add(model)
            })
            model.save()
        },
        // Deletes an award
        deleteAward: function (event) {
            var $target = $(event.currentTarget)
                , model = this.collection.get($target.attr("data-delete"))
            if (confirm("Willst du den Award \"" + model.escape("title") + "\" wirklich löschen?")) {
                model.destroy()
            }
        }
    })

})()