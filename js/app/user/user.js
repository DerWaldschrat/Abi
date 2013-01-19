// This file contains user models, collections and the profileview
(function () {

    /**
     * The main user model class
     * @class Abi.Model.User
     */
    Abi.Model.User = Backbone.Model.extend({
        // You must not call fetch or destroy on your own user model
        fetch: null,
        destroy: null,
        // The idAttribute needs to be changed here
        idAttribute: "userid",
        urlRoot: "User/",
        // Direct access to the rights property
        rights: function () {
            return this.get("rights")
        },
        fetchNamedLessons: function () {
            if (this.has("namedLessons")) {
                return
            }
            var self = this
            $.ajax({
                url: ROOT + "Timetable/me/?named=1",
                success: function (resp) {
                    self.set("namedLessons", resp)
                }
            })
        }
    })

    /**
     * The limited user class, represents all other users
     * @class Abi.Model.LimitedUser
     */
    Abi.Model.LimitedUser = Backbone.Model.extend({
        urlRoot: "User/",
        // Never use these on LimitedUsers
        destroy: null,
        save: null,
        idAttribute: "userid",
        // Prepare for autocomplete feature
        initialize: function () {
            this.setOuter();
            this.listenTo(this, "change", this.setOuter);
            this._fetchedRest = false;
        },
        setOuter: function () {
            this.label = this.text = this.get("vorname") + " " + this.get("nachname");
            this.value = this.id;
        },
        // Fetches the rest of the data because we have only loaded the id and names
        fetchrest: function () {
            if (this._fetchedRest) return;
            var self = this;
            $.ajax({
                url: ROOT + this.urlRoot + "rest.php?" + this.id,
                type: "get",
                dataType: "json",
                success: function (data) {
                    self.set(data);
                    self._fetchedRest = true;
                },
                error: function (error) {
                    self.trigger("resterror", error);
                }
            })
        }
    })

    /**
     * Collection for the corresponding model
     * @class Abi.Collection.LimitedUsers
     */
    Abi.Collection.LimitedUsers = Backbone.Collection.extend({
        model: Abi.Model.LimitedUser,
        urlRoot: "User/",
        // Get only the male users
        male: function () {
            return this.filter(function (model) {
                return model.get("geschlecht") === "male";
            })
        },
        female: function () {
            return this.filter(function (model) {
                return model.get("geschlecht") === "female";
            })
        }
    });
})()