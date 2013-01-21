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
})();