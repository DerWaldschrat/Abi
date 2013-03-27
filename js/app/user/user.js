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
     * Used for commenting other users
     * @class Abi.Model.Comment
     */
    Abi.Model.Comment = Backbone.Model.extend({
        idAttribute: "commentid",
        urlRoot: "Comment/"
    })

    /**
     * @class Abi.Collection.Comments
     */
    Abi.Collection.Comments = Backbone.Collection.extend({
        urlRoot: "Comment/",
        model: Abi.Model.Comment
    })

    /**
     *
     * @class Abi.Collection.OwnComments
     */
    Abi.Collection.OwnComments = Abi.Collection.Comments.extend({
        urlRoot: "Comment/mine/"
    })

    /**
     * Keeps track of the top search bar
     * @class Abi.View.HeadView
     */
    Abi.View.HeadView = Backbone.View.extend({
        initialize: function () {
            // We have to watch out whether the user is allowed to search for others
            if (Abi.App.user.rights() > 0) {
                this.userSearchView = new Abi.View.AutocompleteUser({
                    el: document.getElementById("searchPupil"),
                    collection: userList
                })
				// Append publish data settings
				this.$("form").append("<input type='button' class='btn btn-info publishSettings' value='Veröffentlichungseinstellungen bearbeiten' title='Hier kannst du angeben, was nicht von dir veröffentlicht werden soll!' />")
				if (Abi.App.user.get("publish_ok") == 0) {
					this.showOverlay()
				}
            } else {
                $("#searchPupil, #searchPupilStart").remove()
            }
        },
        events: {
            "click #searchPupilStart": function () {
                // Start the user search
                Abi.App.router.navigate("profile/" + this.userSearchView.value(), {trigger: true})
            },
			"click .publishSettings": "showOverlay"
        },
		showOverlay: function () {
			var view = new Abi.View.PublishSettingsView();
			$("body").append(view.render().el)
		}
    })
	
	Abi.View.PublishSettingsView = Backbone.View.extend({
		events: {
			"submit form": "save",
			"click .close": function () {
				this.remove()
			}
		},
		save: function (event) {
			event.preventDefault()
			var data = {
				publish_ok: this.$("#publishAllowed").prop("checked") ? 1 : 0,
				publish_problems: this.$("#publishForbidden").val()
			}, self = this
			App.user.set(data)
			$.ajax(ROOT + "User/publishSettings.php", {
				type: "POST",
				data: JSON.stringify(data),
				processData: false,
				contentType: "application/json"
			}).done(function () {
				alert("Einstellungen erfolgreich gespeichert!");
			}).fail(function () {
				alert("Einstellungen konnten nicht gespeichert werden! Versuche es bitte über den Button in der oberen Leiste in ein paar Minuten erneut!");
			}).always(function () {
				self.remove()
			})
		},
		render: function () {
			var content = "<div style='padding: 10px; width: 100%; height: 100%; overflow: scroll;'><span class='close'>&times;</span><h1>Deine Veröffentlichungseinstellungen</h1>"
			+ "<div class='alert alert-warning'><h3>Beachte:</h3> Du musst der Veröffentlichung deiner Daten in der Abizeitung zustimmen. Dafür bitte einfach unten das entsprechende Feld markieren. "
			+ "Weiterhin kannst du hier angeben, was nicht von dir veröffentlicht werden soll, etwa irgendwelche besonders blöden Kommentare.</div>"
			+ "<form class=''>"
			+ "<label><input type='checkbox' id='publishAllowed' " + (Abi.App.user.get("publish_ok") == 0 ? "" : "checked='checked' ") + "/> Hiermit stimme ich der Veröffentlichung meiner über diese Seite gesammelten Daten in der Abizeitung des Jahrganges 2011/2013 des Friedrich-Dessauer-Gymnasiums zu, mit folgenden Ausnahmen:</label>"
			+ "<label>Diese Ausnahmen sind:<br /><textarea id='publishForbidden'>" + (Abi.App.user.get("publish_problems") == null ? "" : Abi.App.user.get("publish_problems")) + "</textarea>"
			+ "<br /><input type='submit' value='Einstellungen speichern!' class='btn' />"
			+ "</form></div>"
			this.$el.html("<div style='position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: black; opacity: 0.5;z-index: 9999'></div>"
			+ "<div style='position: absolute;position: fixed; top: 5%; left: 5%; width: 90%; height: 90%; background: white; border: 1px solid black; z-index: 10000;'>"+content+"</div>")
			return this
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
        // Called when model properties change
        change: function (model) {
            var changed = model.changedAttributes(), i
            for (var i in changed) {
                if (i !== "profile") {
                    this.$("#" + i).val(changed[i])
                }
            }
        },
        // Called after each sync
        sync: function () {
            this.message("userSaveSucceed", true)
        },
        // Called when user input changes
        changeModel: function (event) {
            var $this = $(event.currentTarget)
            this.model.set($this.attr("id"), $this.val())
        }
    })

    /**
     * @class View.AutocompleteUser
     */
    Abi.View.AutocompleteUser = Backbone.View.extend({
        initialize: function () {
            this.$el.data("real-value", -1).autocomplete({
                source: _.bind(this.source, this),
                minLength: 0
            })
        },
        // Override the default implementation of the autocomplete events
        events: {
            "autocompletefocus": function (event, ui) {
                return this.store(ui)
            },
            "autocompleteselect": function (event, ui) {
                return this.store(ui)
            },
            "keyup": "_storeNil"
        },
        // Stores the actual value
        store: function (ui, op) {
            this.$el.val(ui.item.label).data("real-value", ui.item.value)
            // Trigger only when it is nessecary
            if(!op || !op.silent) {
                this.trigger("selected", ui.item.value, this.$el, this.model)
            }
            return false
        },
        source: function (request, response) {
            var term = request.term.toLowerCase()
            response(this.collection.filter(function (model) {
                var label = model.text.toLowerCase()
                // We need to be very fast
                if (term === label) return true
                return label.indexOf(term) > -1
            }));
        },
        // Both setter and getter
        value: function (attr) {

            if (arguments.length > 0) {
                this.store({
                    item: this.collection.get(attr) || {label: "", value: -1}
                }, {silent: true})
            }
            return this.$el.data("real-value")
        },
        _storeNil: function() {
            if (this.$el.val() === "") {
                this.store({
                    item: {
                        label: "",
                        value: -1
                    }
                })
            }
        },
        remove: function () {
            this.$el.autocomplete("destroy")
            return Backbone.View.prototype.remove.apply(this, arguments)
        }
    })
})()