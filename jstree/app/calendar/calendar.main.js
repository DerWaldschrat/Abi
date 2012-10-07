steal("jstree/moment").then(function () {
    var mom = moment
    Abi.View.CalendarMainView = Abi.View.Base.extend({
        el: "table",
        className: "table table-bordered table-striped calendar",
        initialize: function () {
            console.log(mom)
            this.from = mom()
            this.to = this.from.clone().add("d", 28)
        },
        templateHead: function () {
            var html = "<thead>",
                moment = mom()
            for (var i = 0; i < 7; i++) {
                html += "<th>" + moment.format("DDDD") + "</th>"
            }
            html += "</thead>"
            console.log(html)
            return html
        },
        render: function () {
            this.$el.html(this.templateHead()).append("<tbody></tbody>")
            return this
        }
    })

})