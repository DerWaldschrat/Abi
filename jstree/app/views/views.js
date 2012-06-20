(function () {
    var Abi = this.Abi;

    /**
     * @class View.HeadView
     */
    Abi.View.HeadView = Abi.View.Base.extend({
        initialize: function () {
            // We have to watch out whether the user is allowed to search for others
            if (Abi.App.user.rights() > 0) {
                this.userSearchView = new Abi.View.AutocompleteUser({
                    el: document.getElementById("searchPupil"),
                    collection: userList
                });    
            } else {
                $("#searchPupil, #searchPupilStart").remove();
            }
        },
        events: {
            "click #searchPupilStart": function () {
                // Start the user search
                Abi.App.router.navigate("profile/" + this.userSearchView.value(), {trigger: true});
            }
        }
    });
    /**
     * @class View.Profile
     * The class for viewing the own profile
     */
    Abi.View.Profile = Abi.View.Base.extend({
        tagName: "form",
        initialize: function () {
            this.model.on("error", this.error, this).on("change", this.change, this).on("sync", this.sync, this);
            
            
        },
        // The template for the profile
        template: function () {
            return "<ul class='formList'>" +
                "<li><label for='geburtstag'>Geburtstag</label><input type='text' id='geburtstag' /></li>" +
                "<li><label for='strasse'>Straße</label><input type='text' id='strasse' /></li>" +
                "<li><label for='wohnort'>Wohnort</label><input type='text' id='wohnort' /></li>" +
                "<li><label for='danksagung'>Wem möchtest du danken?</label><textarea id='danksagung'></textarea></li>" +
                "<li><label for='positiv'>Was war positiv während deiner Schulzeit?</label><textarea id='positiv'></textarea></li>" +
                "<li><label for='negativ'>Was war negativ während deiner Schulzeit?</label><textarea id='negativ'></textarea></li>" +
                "<li><label for='zukunft'>Was willst du in Zukunft machen?</label><textarea id='zukunft'></textarea></li>" +
                "<li><input type='submit' value='Änderungen speichern!' /></li>" +
                "<li class='statusField'></li>" +
                "</ul>";
        },
        render: function () {
            var self = this;
            this.$el.html(this.template());
            this.$("#geburtstag").datepicker({
                defaultDate: this.model.get("geburtstag"),
                minDate: "01.01.1992",
                maxDate: "31.12.1995"
            });
            return this.rerender();
        },
        rerender: function () {
            var self = this;
            this.$("input:not([type='file']), textarea").not(":submit").each(function () {
                $(this).val(self.model.get(this.id));
            });
            return this;
        },
        events: {
            "change input:not([type='file']), textarea": "changeEvent",
            "submit": function (event) {
                this.model.save();
                this.$(":submit").after(Abi.App.getLoading());
                event.preventDefault();
            }
        },
        error: function (model, error) {
            this.message(error);
            this.$(".ajaxLoading").remove();
        },
        change: function (model) {
            var changed = model.changedAttributes(), i;
            for (var i in changed) {
                if (i !== "profile") {
                    this.$("#" + i).val(changed[i]);    
                }
            }
        },
        sync: function () {
            this.message("userSaveSucceed", true);
            this.$(".ajaxLoading").remove();
        },
        changeEvent: function (event) {
            var $this = $(event.currentTarget);
            this.model.set($this.attr("id"), $this.val());

        },
        _changeProfile: function () {
            
        }
    });
    /**
     * @class View.UserProfile
     * Contains all the logic for presenting other Users
     */
    Abi.View.UserProfile = Abi.View.Base.extend({
        initialize: function (opts) {
            this.modelId = opts.modelId;
            this.change();
            this.collection.on("reset", this.change, this);
            this._nothing = "<i>" + Abi.App.message("nothing") + "</i>";
        },
        events: {
            "submit .commentUserForm": function () {
                var val = this.$(".userComment").val();
                if (!!val) {
                    var model = new Abi.Model.Comment();
                    this.$("form .submit").prop("disabled", true).after(Abi.App.getLoading());
                    model.on("error", this.error, this).on("sync", this.sync, this).save({
                        fromid: Abi.App.user.id,
                        toid: this.model.id,
                        content: val
                    });
                }
                return false;
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
                "<ul class='formList'>" +
                "<li><label for='userComment" + this.cid + "'>Was kannst du über <span class='vorname'></span> <span class='nachname'></span> sagen?</label><textarea id='userComment" + this.cid + "' class='userComment'></textarea></li>" +
                "<li><input type='submit' value='Abschicken' class='submit' /></li>" +
                "<li class='statusField'></li>" +
                "</ul>" +
                "</form>";
        },
        render: function () {
            if (this.model) {
                this.$el.html(this.template());
                this.changeModel();
            } else {
                this.$el.empty();
                this.$el.append(Abi.App.getLoading());
            }
            return this;
        },
        change: function () {
            if(this.model) this.model.off("change", this.changeModel, this).off("resterror", this.restError, this);
            this.model = this.collection.get(this.modelId);
            if (this.model) {
                this.model.on("change", this.changeModel, this).on("resterror", this.restError, this).fetchrest();
            }
            this.render();
        },
        changeModel: function () {
            var _mapovers = ["vorname", "nachname", "geburtstag", "geschlecht", "strasse", "wohnort"],
                transforms = {
                    geschlecht: function (val) {
                        var m = {
                            male: "männlich",
                            female: "weiblich"
                        };
                        return m[val];
                    }
                };
            for (var i = 0, len = _mapovers.length, curr, val; i < len; i++) {
                curr = _mapovers[i];
                val = this.model.get(curr);
                if (!!val) {
                    this.$("." + curr).text( (_.isFunction(transforms[curr]) ? transforms[curr](val) : val));
                } else if (_.isUndefined(val)) {
                    this.$("." + curr).empty().append(this.theRestError ? this._nothing :  Abi.App.getLoading())
                } else {
                    this.$("." + curr).empty().append(this._nothing);
                }
            }
        },
        restError: function () {
            this.theRestError = true;
            this.changeModel();
        },
        error: function (model, error) {
            this.message(error);
            this._removeLoadingForm();
            model.off();
        },
        sync: function () {
            this.message("commentSaveSucceed", true);
            this.$(".userComment").val("");
            this._removeLoadingForm();
            model.off();
        },
        _removeLoadingForm: function () {
            this.$("form .ajaxLoading").remove();
            this.$("form .submit").prop("disabled", false);
        }
    });

    /**
     * @class View.Comments
     */
    Abi.View.Comments = Abi.View.Base.extend({
        initialize: function () {
            this.collection = new Abi.Collection.Comments();
            this.$el.append(Abi.App.getLoading());
            this.collection.on("reset", this.render, this).fetch();
        },
        render: function () {
            var html = "<h1>Andere über dich</h1><ul class='itemList'>";
            this.collection.each(function (model) {
                html += "<li>" + _.escape(model.get("content")) + "</li>";
            });
            html += "</ul>";
            this.$el.html(html);
            return this;
        }
    });

    /**
     * @class View.Quote
     * used for the quotes
     */
    Abi.View.Quote = Abi.View.Base.extend({
        initialize: function () {
            this.newModel();
            this.quoteList = new Abi.View.QuoteList({
                collection: new Abi.Collection.Quotes()
            });
            var self = this;
            this.quoteList.collection.fetch({
                success: function () {
                    self.$el.append(self.quoteList.el);
                }
            });
        },
        tagName: "div",
        events: {
            "submit": function (event) {
                this.clearMessage();
                this.$(":submit").after(Abi.App.getLoading());
                var val = this.$("#qContent").val();
                this.model.save({
                    content: val
                });
                event.preventDefault();
            }
        },
        render: function () {
            var html = "<form action='#'>" +
                "<ul class='formList'>" +
                "<li><label for='qContent'>Dein Spruch</label><textarea id='qContent'></textarea></li>" +
                "<li><input type='submit' value='Eintragen' /></li>" +
                "<li class='statusField'></li>" +
                "</ul>" +
                "</form>";
            this.$el.html(html);
            return this;
        },
        clearUp: function () {
            this.$("#qContent").val("");
            this.$(".ajaxLoading").remove();
        },
        sync: function () {
            this.message("quoteSaveSucceed", true);
            this.clearUp();
            // Remove sync callback, the behavior otherwise is funny
            this.model.off("sync", this.sync);
            this.quoteList.collection.add(this.model);
            this.newModel();
        },
        error: function (model, error) {
            this.message(error);
            this.$(".ajaxLoading").remove();
        },
        newModel: function () {
            this.model = new Abi.Model.Quote({
                userid: Abi.App.user.id
            });
            this.model.on("error", this.error, this).on("sync", this.sync, this);
        }
    });
    /**
     * @class View.QuoteList
     * Contains all the Quotes a user has
     */
    Abi.View.QuoteList = Abi.View.Base.extend({
        tagName: "ul",
        className: "itemList",
        initialize: function () {
            this._subviews = {};
            // Set events
            this.collection.on("reset", this.render, this).on("add", this.add, this).on("remove", this.remove, this).on("error", this.error, this);

        },
        render: function () {
            var self = this;
            this._subviews = {};
            this.$el.contents().remove();
            this.collection.each(function (model) {
                self.add(model);
            });
            return this;
        },
        add: function (model) {
            var v = this._subviews[model.cid] = new Abi.View.QuoteDisplay({
                model: model
            });
            this.$el.prepend(v.render().el);
        },
        remove: function (model) {
            var v = this._subviews[model.cid];
            v.remove();
            this._subviews[model.cid] = null;
        },
        error: function (error) {
        }
    });

    /**
     * @class View.QuoteDisplay
     */
    Abi.View.QuoteDisplay = Abi.View.Base.extend({
        tagName: "li",
        initialize: function () {
            this.model.on("error", this.error, this);
        },
        events: {
            "click .removeButton": function () {
                this.model.destroy({wait: true});
            }
        },
        template: function () {
            var html = "<span class='removeButton' title='Spruch löschen'>X</span>" + _.escape(this.model.get("content"));
            return html;
        },
        render: function () {
            this.$el.html(this.template());
            return this;
        },
        error: function () {

        }
    });

    /**
     * @class View.AutocompleteUser
     */
    Abi.View.AutocompleteUser = Abi.View.Base.extend({
        initialize: function (options) {
            this.$el.data("real-value", -1).autocomplete({
                source: _.bind(this.source, this)
            });
        },
        // Override the default implementation of the autocomplete events
        events: {
            "autocompletefocus": function (event, ui) {
                return this.store(ui);
            },
            "autocompleteselect": function (event, ui) {
                return this.store(ui);
            },
            "keyup": "_storeNil"
        },
        // Stores the actual value
        store: function (ui, op) {
            this.$el.val(ui.item.label).data("real-value", ui.item.value);
            // Trigger only when it is nessecary
            if(!op || !op.silent) {
                this.trigger("selected", ui.item.value, this.$el);
            }
            return false;
        },
        source: function (request, response) {
            var term = request.term.toLowerCase();
            response(this.collection.filter(function (model) {
                var label = model.label.toLowerCase();
                // We need to be very fast
                if (term === label) return true;
                return label.indexOf(term) > -1;
            }));
        },
        // Both setter and getter
        value: function (attr) {

            if (arguments.length > 0) {
                this.store({
                    item: this.collection.get(attr) || {label: "", value: -1}
                }, {silent: true});
            }
            return this.$el.data("real-value");
        },
        _storeNil: function() {
            if (this.$el.val() === "") {
                this.store({
                    item: {
                        label: "",
                        value: 0
                    }
                })
            }    
        }
    });

    /**
     * @class View.Award
     * Contains all the logic for the awardlist
     */
    Abi.View.Award = Abi.View.Base.extend({
        initialize: function () {
            this.collection = new Abi.Collection.Awards();
            this.collection.on("add", this.add, this).refetch();
            this._items = {};
            this.table = $(document.createElement("table")).addClass("table-bordered table");
            var tr = $(document.createElement("tr")),
                heads = ["männlich", "Award", "weiblich"];
            _.each(heads, function (head) {
                var el = $(document.createElement("th"));
                el.text(head);
                tr.append(el);
            });
            this.table.append(tr);
            this.$el.append(this.table);

            this.addForm = $(this.templateAddForm());
            this.$el.prepend(this.addForm);
        },
        templateAddForm: function () {
            return "<form action='#' id='createNewAward'>" +
                "<ul class='formList'>" +
                "<li><label for='awardTitle'>Name der neuen Kategorie</label><input type='text' name='awardTitle' id='awardTitle' /></li>" +
                "<li><input type='submit' value='Erstellen' /></li>" +
                "</ul>" +
                "</form>";
        },
        add: function (model) {
            var item = new Abi.View.AwardItem({
                model: model
            });
            model.off("sync", this.add, this);
            this._items[item.cid] = item;
            this.table.append(item.el);
        },
        events: {
            "submit #createNewAward": function () {
                var $title = this.$("#awardTitle"),model = new Abi.Model.Award({
                    title: $title.val(),
                    userid: Abi.App.user.id
                });
                $title.val("");
                model.on("sync", this.add, this).save();
                return false;
            }
        }
    });
    /**
     * @class View.AwardItem
     */
    Abi.View.AwardItem = Abi.View.Base.extend({
        tagName: "tr",
        initialize: function () {
            this.render();
            this._delay = 1000;
        },
        render: function () {
            this.cells = new Array(3);
            for (var i = 0, len = this.cells.length; i < len; i++) {
                this.cells[i] = document.createElement("td");
            }
            // Create jQuery objects
            this.$left = $(this.cells[0]);
            this.$middle = $(this.cells[1]);
            this.$right = $(this.cells[2]);
            // Set content of the elements
            this.$left.html("<input type='text' class='maleUser' />");
            this.$right.html("<input type='text' class='femaleUser' />");
            this.$middle.addClass("center").text(this.model.get("title"));
            // Create autocompletes
            this.maleAuto = new Abi.View.AutocompleteUser({
                collection: userList.maleList,
                el: this.$left.find("input")[0]
            });
            this.femaleAuto = new Abi.View.AutocompleteUser({
                collection: userList.femaleList,
                el: this.$right.find("input")[0]
            });
            //
            this.maleAuto.on("selected", this.changeMale, this).value(this.model.get("maleid"));
            this.femaleAuto.on("selected",this.changeFemale, this).value(this.model.get("femaleid"));
            this.$el.append(this.cells);
        },
        changeMale: function (id) {
            this.model.set("maleid", id);
            this.model.delaySave(this._delay);
        },
        changeFemale: function (id) {
            this.model.set("femaleid", id);
            this.model.delaySave(this._delay);
        }
    });
}).call(this);