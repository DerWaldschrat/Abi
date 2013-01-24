(function () {

    var ROUTE = "posted"
    App.router.route(ROUTE, ROUTE, function () {
        App.setView(new Abi.View.OwnComments())
    })

    /**
     * Displays all comments you
     * @class Abi.View.OwnComments
     */
    Abi.View.OwnComments = Backbone.View.extend({
        events: {
            "click .commentToUser a": function (event){
                event.preventDefault()
                var $target = $(event.target)
                App.router.navigate($target.attr("href"), {
                    trigger: true
                })
            },
            // Destroy model
            "click .removeButton": function (event) {
                var $target = $(event.currentTarget)
                    , model = this.collection.get($target.attr("data-id"))
                console.log($target.attr("data-id"), $target)
                model.destroy()
            }
        },
        initialize: function () {
            this.collection = new Abi.Collection.OwnComments()
            this.listenTo(this.collection, "add", this.add)
                .listenTo(this.collection, "remove", this.destroy)
                .listenTo(this.collection, "reset", this.render)
            this.collection.fetch()
        },
        render: function () {
            var html = "<h1>Du über andere</h1><ul>", self = this
            this.collection.each(function (model) {
                html += self.templateItem(model)
            })
            html += "</ul>"
            this.$el.html(html)
            return this
        },
        _id: function (model) {
            return "comment" + model.cid
        },
        templateItem: function (model) {
            var user = userList.get(model.get("toid"))
            return "<li id='" + this._id(model) + "'>" +
                "<span class='commentToUser'>" +
                    "<a href='profile/" + user.id + "'>" + user.escape("vorname") + " " + user.escape("nachname") + "</a>" +
                "</span>" + model.escape("content") +
                "<i class='removeButton icon-trash' title='Diesen Kommentar löschen' data-id='" + model.cid + "'></i>" +
                "</li>"
        },
        add: function (model) {
            this.$el.append(this.templateItem(model))
        },
        destroy: function (model) {
            this.$("#" + this._id(model)).remove()
        }
    })
})()