// Simply lists all users, for easy comment adding
(function () {
    var ROUTE = "alluser"
    App.router.route(ROUTE, ROUTE, function () {
        var view = new Abi.View.AllUserList({
            collection: userList
        })
        App.setView(view)
    })

    Abi.View.AllUserList = Backbone.View.extend({
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
                    + _asHyperlink(curr.escape("vorname") + " " + curr.escape("nachname"))
                    + "</td>"
                    + "<td>"
                    + _asHyperlink(curr.escape("nickname"))
                    + "</td>"
                    + "<td><form action='#' class='allUserCommentForm form-inline' data-id='" + curr.id + "'><fieldset class='control-group'>"
                    + (disabled ? "<i>Das bist du selbst</i>"
                    : ("<input type='text' name='allUserComment" + curr.id + "' id='allUserComment" + curr.id + "' class='allUserComment ' title='Dein Kommentar zu " + curr.escape("vorname") + " " + curr.escape("nachname") + "' />"
                    + "<input type='submit' class='allUserCommentSubmit btn' value='Speichern' id='allUserSubmit" + curr.id + "' />") )
                    + "</fieldset></form></td>"
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
                this.listenTo(model, "sync", this.sync, this).listenTo(model, "error", this.error, this)
                model.save({
                    fromid: App.user.id,
                    toid: $target.attr("data-id"),
                    content: val
                })
            }
        },
        sync: function (model) {
            this.stopListening(model)
            var msg = App.message("commentSaveSucceed")
                , $el = this.$("#allUserComment" + model.get("toid")).val(msg)
            $el.parent().addClass("success")
            window.setTimeout(function () {
                $el.parent().removeClass("success")
                if ($el.val() == msg) {
                    $el.val("").parent().removeClass("success")
                }
            }, 3000)
        },
        error: function (model, error) {
            this.stopListening(model)
            var msg = App.message(error)
                , $el = this.$("#allUserComment" + model.get("toid"))
            $el.val(msg).parent().addClass("error")
            window.setTimeout(function () {
                $el.parent().removeClass("error")
                if ($el.val() == msg) {
                    $el.val("")
                }
            }, 3000)
        }
    })
})()