// Contains the tool to set rights
(function () {
    var ROUTE = "usermanager"

    Abi.View.UserManager = Backbone.View.extend({
        _subviewList: ["_subviews"],
        initialize: function () {
            this.$table = null
            this.listenTo(this.collection, "reset", this.render)
        },
        // Creates the headrow
        _headForRights: function (right) {
            var row = document.createElement("tr"), els = ["ID", "Vorname", "Nachname", "Rechte"], el
            for(var i = 0, len = els.length; i < len; i++) {
                el = document.createElement("td")
                el.innerHTML = els[i]
                row.appendChild(el)
            }
            return row
        },
        render: function () {
            var $table = $(document.createElement("table")).addClass("table table-bordered"), self = this, curr
            // Reset subviews
            this._subviews = {}
            this.collection.each(function (model) {
                curr = self._subviews[model.cid] = new Abi.View.UserManagerItem({
                    model: model
                });
                $table.append(curr.render().el)
            });
            this.$el.empty()
            this.$el.append($table)
            this.$table = $table
            return this
        }
    })

    Abi.View.UserManagerItem = Backbone.View.extend({
        tagName: "tr",
        initialize: function () {
            // If this is the active user, show that
            if (App.user.id == this.model.id) {
                this.$el.css("color", "red").addClass("currentUser")
            }
            this.listenTo(this.model, "change", this.render)
        },
        template: function () {
            return "<td>" + _.escape(this.model.id) + "</td>"
                + "<td>" + this.model.escape("vorname") + "</td>"
                + "<td>" + this.model.escape("nachname") + "</td>"
                + "<td><input type='text' id='" + this.model.cid + "-rights' class='rights' value='" + this.model.escape("rights") + "' "
                // You cannot change the rights of yourself
                + (App.user.id == this.model.id ? "readonly disabled" : "") + " /></td>"
        },
        render: function () {
            this.$el.html(this.template())
            return this
        },
        events: {
            "blur .rights": function (event) {
                var $input = $(event.currentTarget), val = parseInt($input.val()), save = true, rights = App.user.rights()
                if (isNaN(val)) {
                    $input.val(this.model.get("rights"))
                    // We do not need to save now
                    save = false
                    // You cannnot assign rights bigger than your own
                } else if (val > rights) {
                    $input.val(val = rights)
                }
                if (save && this.model.get("rights") != val) this.save(val)
            }
        },
        // Normally we should not save manually, but in this case it is the easiest solution
        save: function (val) {
            var json = {
                userid: this.model.id,
                val: val
            }, success = _.bind(this.success, this), error = _.bind(this.error, this)
            // Do not allow to leave the page
            $.ajax(this.url, {
                dataType: "json",
                type: "PUT",
                data: JSON.stringify(json),
                success: success,
                error: error
            })

        },
        url: ROOT + "User/changeRights.php",
        success: function (data) {
            this.model.set("rights", data.rights)
        },
        error: function () {
            this.$(".rights").val(this.model.get("rights"))
        }
    })

    App.router.route(ROUTE, ROUTE, function () {
        var view = new Abi.View.UserManager({
            collection: userList
        })
        App.setView(view)
    })
})()
