// The usermanager
// Used for enabling users
App.user.rights() >= 2 ? (function () {
    
    // The route used for this    
    var ROUTE = "usermanager";
    
    // Add navigation
    App.addNavigationItem(ROUTE, "User freischalten");    
    
    /**
     * @Abi.View.UserManager
     * Used for viewing the User enabling process
     * */
    Abi.View.UserManager = Abi.View.Base.extend({
        _subviewList: ["_subviews"],
        bindToCollection: {
            "reset": "render"
        },
        initialize: function () {
            this.$table = null;   
        },
        // Creates the headrow
        _headForRights: function (right) {
            var row = document.createElement("tr"), els = ["ID", "Vorname", "Nachname", "Rechte"], el;
            for(var i = 0, len = els.length; i < len; i++) {
                el = document.createElement("td");
                el.innerHTML = els[i];
                row.appendChild(el);    
            }
            return row;               
        },
        render: function () {
            this.$el.append(App.getLoading());
            var $table = $(document.createElement("table")).addClass("table table-bordered"), self = this, curr;
            // Reset subviews
            this._subviews = {};
            this.collection.each(function (model) {
                curr = self._subviews[model.cid] = new Abi.View.UserManagerItem({
                    model: model
                });
                $table.append(curr.render().el);
            });
            this.$el.empty();
            this.$el.append($table);
            this.$table = $table;                
            return this;            
        },
        remove: function () {
            var i;
            for (i in this._subviews) {
                this._subviews[i].remove();
            }
            Abi.View.Base.prototype.remove.call(this);
        }         
    });
    
    Abi.View.UserManagerItem = Abi.View.Base.extend({
        bindToModel: {
            "change": "render"
        },
        tagName: "tr",
        initialize: function () {
            // If this is the active user, show that
            if (App.user.id == this.model.id) {
                this.$el.css("color", "red").addClass("currentUser");   
            }                
        },
        template: function () {
            return "<td>" + _.escape(this.model.id) + "</td>"
            + "<td>" + _.escape(this.model.get("vorname")) + "</td>" 
            + "<td>" + _.escape(this.model.get("nachname")) + "</td>"
            + "<td><input type='text' id='" + this.model.cid + "-rights' class='rights' value='" + _.escape(this.model.get("rights")) + "' "
            // You cannot change the rights of yourself 
            + (App.user.id == this.model.id ? "readonly disabled" : "") + " /></td>";    
        },
        render: function () {
            this.$el.html(this.template());
            return this;
        },
        events: {
            "blur .rights": function (event) {
                var $input = $(event.currentTarget), val = parseInt($input.val()), save = true, rights = App.user.rights();
                if (isNaN(val)) {
                    $input.val(this.model.get("rights"));
                    // We do not need to save now
                    save = false
                // You cannnot assign rights bigger than your own
                } else if (val > rights) {
                    $input.val(val = rights)                    
                }
                if (save && this.model.get("rights") != val) this.save(val);             
            }
        },
        // Normally we should not save manually, but in this case it is the easiest solution
        save: function (val) {
            var json = {
                userid: this.model.id,
                val: val    
            }, success = _.bind(this.success, this), error = _.bind(this.error, this);
            // Do not allow to leave the page
            App.retainBackgroundProcess();
            $.ajax(this.url, {
                dataType: "json",
                type: "PUT",
                data: JSON.stringify(json),
                success: success,
                error: error,
                complete: function () {
                    // Now leaving the page is allowed
                    App.releaseBackgroundProcess();
                } 
            });
                
        },
        url: ROOT + "User/changeRights.php",
        success: function (data) {
            this.model.set("rights", data.rights);    
        },
        error: function () {
            this.$(".rights").val(this.model.get("rights"));
        }    
    });    
    
    // Add route for this 
    App.router.route(ROUTE, ROUTE, function () {
        var view = new Abi.View.UserManager({
            collection: userList
        });
        App.setView(view);
    });
        
}).call(this) : 0;