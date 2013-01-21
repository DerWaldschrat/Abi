(function () {
    var ROUTE = "yourcomments"

    App.router.route(ROUTE, ROUTE, function () {
        App.setView(new Abi.View.Comments())
    })

    Abi.View.Comments = Backbone.View.extend({
        initialize: function () {
            this.collection = new Abi.Collection.Comments()
            this.listenTo(this.collection, "reset", this.render)
            this.collection.fetch()
        },
        render: function () {
            var html = "<h1>Andere über dich</h1><ul class='itemList'>"
            this.collection.each(function (model) {
                html += "<li>" + model.escape("content") + "</li>"
            });
            html += "</ul>"
            this.$el.html(html)
            return this
        }
    })
})();