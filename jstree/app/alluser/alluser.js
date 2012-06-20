// The list of all Users
App.user.rights() >= 1 ? (function () {
    var ROUTE = "alluser"
    
    App.addNavigationItem(ROUTE, "Alle User anzeigen")
    
    Abi.View.AllUserList = Abi.View.Base.extend({
        initialize: function () {
            this._commentViews = {}    
        },
        template: function () {
            var template = "<span class='allUserError'></span><table><thead><tr>"
            // Table head
            , fields = ["Name", "Nickname", "Kommentiere..."]
            , curr
            , _asHyperlink = function (val) {
                return "<a href='#profile/" + curr.id +  "'>" + val + "</a>"                
            }, disabled
            for (var i = 0, len = fields.length; i < len; i++) {
                template += "<th>" + fields[i] + "</th>"
            }            
            template += "</tr></thead><tbody>"
            // The actual data
            for (var i = 0, len = this.collection.length; i < len; i++) {
                curr = this.collection.at(i)
                disabled = curr.id == App.user.id
                template += "<tr id='alluser" + curr.id + "'>"
                + "<td>"
                + _asHyperlink(curr.get("vorname") + " " + curr.get("nachname"))
                + "</td>"
                + "<td>"
                + _asHyperlink(curr.get("nickname"))
                + "</td>"
                + "<td><form action='#' class='allUserCommentForm form-inline' data-id='" + curr.id + "'>"
                + (disabled ? "<i>Das bist du selbst</i>"
                : ("<input type='text' name='allUserComment" + curr.id + "' id='allUserComment" + curr.id + "' class='allUserComment' title='Dein Kommentar zu " + curr.get("vorname") + " " + curr.get("nachname") + "' />"
                + "<input type='submit' class='allUserCommentSubmit btn' value='Speichern' />") ) 
                + "</form></td>"
                + "</tr>"
                   
            }
            template += "</tbody></table>"
            return template;        
        },
        render: function () {
            this.$el.html(this.template()).find("table").addClass("table table-bordered")
            return this;
        },
        events: {
            "submit .allUserCommentForm": function (event) {
                event.preventDefault()
                var model = new Abi.Model.Comment()
                , $target = $(event.target)
                , val = $target.find(".allUserComment").val()
                $target.find(".allUserComment").val("")
                model.on("sync", this.sync, this).on("error", this.error, this).save({
                    fromid: App.user.id,
                    toid: $target.attr("data-id"),
                    content: val
                })                                 
            }
        },
        sync: function (model) {
            model.off()
            this.$(".allUserError").text(App.message("commentSaveSucceed"))
        },
        error: function (model, error) {
            model.off()
            this.$(".allUserError").text(App.message(error))
        }
    })
    
    App.router.route(ROUTE, ROUTE, function () {
        var view = new Abi.View.AllUserList({
            collection: userList
        }).render()
        App.reset().append(view.el)
    })    
}).call(this) : 0;