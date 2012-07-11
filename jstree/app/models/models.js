(function () {
    var Abi = this.Abi;
    /**
     * @abstract Mixin.DelaySave
     * Useful for models when you acually want to delay the saving a bit
     */
    Abi.Mixin.DelaySave = {
        delaySave: function (delay, props, options) {
            var self = this;
            if (this._ii) {
                window.clearInterval(this._ii);
            } else {
                Abi.App.retainBackgroundProcess();
            }
            this._ii = window.setTimeout(function() {
                self.save(props, options);
                Abi.App.releaseBackgroundProcess();
            }, delay);

        }
    };
    /**
     * @class Model.LimitedUser
     * Used for the Autocomplection of the users
     */
    Abi.Model.LimitedUser = Abi.Model.Base.extend({
        urlRoot: "User/",
        destroy: Abi.noop,
        save: Abi.noop,
        idAttribute: "userid",
        // Prepare for autocomplete feature
        initialize: function () {
            this.setOuter();
            this.on("change", this.setOuter, this);
            this._fetchedRest = false;
        },
        setOuter: function () {
            this.text = this.get("vorname") + " " + this.get("nachname");
            this.value = this.id;
        },
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
    });
    /**
     * @class Collection.LimitedUsers
     * Collection for the corresponding model
     */
    Abi.Collection.LimitedUsers = Abi.Collection.Base.extend({
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

    /**
     * @class Model.Quote
     * Used for sending in quotes of teachers
     */
    Abi.Model.Quote = Abi.Model.Base.extend({
        fetch: Abi.noop,
        urlRoot: "Quote/",
        idAttribute: "quoteid",
        validate: function (attr) {
            if (!_.isUndefined(attr.content) && attr.content.length < 10) {
                return "quoteTooShort";
            }
        }
    });

    /**
     * @class Collection.Quotes
     * Collection for the corresponding model
     */
    Abi.Collection.Quotes = Abi.Collection.Base.extend({
        urlRoot: "Quote/",
        model: Abi.Model.Quote
    });

    /**
     * @class Model.Comment
     * Used for commenting other users
     */
    Abi.Model.Comment = Abi.Model.Base.extend({
        idAttribute: "commentid",
        urlRoot: "Comment/"
    });

    /**
     * @class Collection.Comments
     */
    Abi.Collection.Comments = Abi.Collection.Base.extend({
        urlRoot: "Comment/",
        model: Abi.Model.Comment
    });

    /**
     * @class Model.Award
     * Contains all the logic for fetching the existing awards
     */
    Abi.Model.Award = Abi.Model.Base.extend({
        urlRoot: "Award/",
        idAttribute: "awardid"
    });
    // Mixin the delaysave
    _.extend(Abi.Model.Award.prototype, Abi.Mixin.DelaySave);

    Abi.Collection.Awards = Abi.Collection.Base.extend({
        urlRoot: "Award/",
        model: Abi.Model.Award
    });

}).call(this);
