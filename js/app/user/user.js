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
    })

    /**
     * View for displaying the own profile
     * @class Abi.View.Profile
     */
    Abi.View.Profile = Backbone.View.extend({
        tagName: "form",
        events: {
            "change input:not([type='file']), textarea": "changeModel",
            "submit": "submit"
        },
        initialize: function () {
            this.listenTo(this.model, "error", this.error).listenTo(this.model, "change", this.change).listenTo(this.model, "sync", this.sync)
        },
        // The template for the profile
        template: function () {
            return "<fieldset>" +
                "<label for='geburtstag'>Geburtstag</label><input type='text' id='geburtstag' />" +
                "<label for='strasse'>Straße</label><input type='text' id='strasse' />" +
                "<label for='wohnort'>Wohnort</label><input type='text' id='wohnort' />" +
                "<label for='danksagung'>Wem möchtest du danken?</label><textarea id='danksagung'></textarea>" +
                "<label for='positiv'>Was war positiv während deiner Schulzeit?</label><textarea id='positiv'></textarea>" +
                "<label for='negativ'>Was war negativ während deiner Schulzeit?</label><textarea id='negativ'></textarea>" +
                "<label for='zukunft'>Was willst du in Zukunft machen?</label><textarea id='zukunft'></textarea>" +
                "<label for='semi_thema'>Dein Seminararbeitsthema</label><input type='text' id='semi_thema' />" +
                "<label for='p_semi'>Dein P-Seminar</label><input type='text' id='p_semi' class='seminar' />" +
                "<label for='w_semi'>Dein W-Seminar</label><input type='text' id='w_semi' class='seminar' />" +
                "<label for='abi_schriftlich'>Dein schriftliches Abifach</label><input type='text' id='abi_schriftlich' class='schulfach' placeholder='Wähle ein Fach' />" +
                "<label for='abi_muendlich_1'>Dein mündliches Abifach (I)</label><input type='text' id='abi_muendlich_1' class='schulfach' placeholder='Wähle ein Fach' />" +
                "<label for='abi_muendlich_2'>Dein mündliches Abifach (II)</label><input type='text' id='abi_muendlich_2' class='schulfach' placeholder='Wähle ein Fach' />" +
                "</fieldset>" +
                "<fieldset class='buttonAndMessage control-group'><input type='submit' class='btn' value='Änderungen speichern!'>" +
                "<div class='help-block statusField'></div>" +
                "</fieldset>"
        },
        render: function () {
            var self = this
            this.$el.html(this.template())
            this.$("#geburtstag").datepicker({
                defaultDate: this.model.get("geburtstag"),
                minDate: "01.01.1992",
                maxDate: "31.12.1995"
            })
            return this.rerender()
        },
        rerender: function () {
            var self = this;
            this.$("input:not([type='file']), textarea").not(":submit").each(function () {
                $(this).val(self.model.get(this.id))
            });
            return this
        },

        // Event handlers
        submit: function (event) {
            this.clearMessage()
            this.model.save()
            event.preventDefault()
        },
        error: function (model, error) {
            this.message(error)
        },
        change: function (model) {
            var changed = model.changedAttributes(), i
            for (var i in changed) {
                if (i !== "profile") {
                    this.$("#" + i).val(changed[i])
                }
            }
        },
        sync: function () {
            this.message("userSaveSucceed", true)
        },
        changeModel: function (event) {
            var $this = $(event.currentTarget)
            this.model.set($this.attr("id"), $this.val())
        }
    })
})()