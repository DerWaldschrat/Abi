(function () {

    var ROUTE = "profile/:id"
    App.router.route(ROUTE, "profile", function (id) {
        if (id  < 0) {
            alert("User nicht gefunden!");
            // TODO: Better way of handling this
        } else if (id == Abi.App.user.id) {
            Abi.App.router.navigate("ownprofile", {trigger: true});
        } else  {
            var view = new Abi.View.UserProfile({
                collection: userList,
                modelId: id
            })
            Abi.App.setView(view)
        }
    })

    Abi.View.UserProfile = Backbone.View.extend({
        initialize: function (opts) {
            this.modelId = opts.modelId
            this.change()
            this.listenTo(this.collection, "reset", this.change)
            this._nothing = "<i>" + Abi.App.message("nothing") + "</i>"
        },
        events: {
            "submit .commentUserForm": function () {
                this.clearMessage()
                var val = this.$(".userComment").val()
                if (!!val) {
                    var model = new Abi.Model.Comment()
                    this.$("form .submit").prop("disabled", true)
                    this.listenTo(model, "error", this.error).listenTo(model, "sync", this.sync)
                    model.save({
                        fromid: Abi.App.user.id,
                        toid: this.model.id,
                        content: val
                    })
                }
                return false
            }
        },
        template: function () {
            return "<h1>Profil von <span class='vorname'></span> <span class='nachname'></span></h1>" +
                "<div>" +
                "Geschlecht: <span class='geschlecht'></span><br />" +
                "Geburtstag: <span class='geburtstag'></span><br />" +
                "Straße: <span class='strasse'></span><br />" +
                "Wohnort: <span class='wohnort'></span>" +
                "</div>" +
                "<form action='#' class='commentUserForm'>" +
                "<fieldset>" +
                "<label for='userComment" + this.cid + "'>Was kannst du über <span class='vorname'></span> <span class='nachname'></span> sagen?</label><textarea id='userComment" + this.cid + "' class='userComment'></textarea>" +
                "</fieldset>" +
                "<fieldset class='control-group buttonAndMessage'>" +
                "<input type='submit' class='btn' value='Abschicken' />" +
                "<div class='statusField help-block'></div>" +
                "</fieldset>" +
                "</form>"
        },
        render: function () {
            if (this.model) {
                this.$el.html(this.template())
                this.changeModel()
            } else {
                this.$el.empty()
            }
            return this;
        },
        change: function () {
            if(this.model) this.stopListening(this.model)
            this.model = this.collection.get(this.modelId)
            if (this.model) {
                this.listenTo(this.model, "change", this.changeModel).listenTo(this.model, "resterror", this.restError)
                this.model.fetchrest()
            }
            this.render()
        },
        changeModel: function () {
            var _mapovers = ["vorname", "nachname", "geburtstag", "geschlecht", "strasse", "wohnort"],
                transforms = {
                    geschlecht: function (val) {
                        var m = {
                            male: "männlich",
                            female: "weiblich"
                        }
                        return m[val]
                    }
                }
            for (var i = 0, len = _mapovers.length, curr, val; i < len; i++) {
                curr = _mapovers[i]
                val = this.model.get(curr)
                if (!!val) {
                    this.$("." + curr).text( (_.isFunction(transforms[curr]) ? transforms[curr](val) : val))
                } else if (typeof val === 'undefined') {
                    this.$("." + curr).empty().append(this.theRestError ? this._nothing :  $loading)
                } else {
                    this.$("." + curr).empty().append(this._nothing)
                }
            }
        },
        restError: function () {
            this.theRestError = true
            this.changeModel()
        },
        error: function (model, error) {
            this.message(error);
            this.stopListening(model)
        },
        sync: function (model) {
            this.message("commentSaveSucceed", true)
            this.$(".userComment").val("")
            this.stopListening(model)
        }
    })
})()