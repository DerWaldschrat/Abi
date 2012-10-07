steal("jstree/moment").then(function () {
    var mom = moment
    function _hashRange(from, to) {
        return asDate(from) + "h" + asDate(to)
    }
    function asDate(moment) {
        return moment.format("YYYY-MM-DD")
    }
    function asGermanDate(moment) {
        return moment.format("DD.MM.YYYY")
    }

    Abi.Model.Calendar = Abi.Model.Base.extend({
        urlRoot: "Calendar/"
    })

    Abi.Collection.Calendar = Abi.Collection.Base.extend({
        urlRoot: "Calendar/",
        model: Abi.Model.Calendar,
        initialize: function (models, options) {
            this.from = options.from
            this.to = options.to
        },
        url: function () {
            return ROOT + _.result(this, "urlRoot") + "?from=" + encodeURIComponent(asDate(this.from)) + "&to=" + encodeURIComponent(asDate(this.to))
        }
    })

    // Cache all calendar collections in this var
    var cache = {}
    Abi.Collection.Calendar.range = function (from, to) {
        var hash = _hashRange(from, to)
        if (cache[hash] instanceof Abi.Collection.Calendar) {
            return cache[hash]
        }
        cache[hash] = new Abi.Collection.Calendar([], {
            from: from,
            to: to
        })
        cache[hash].fetch()
        return cache[hash]
    }

    Abi.View.CalendarMainView = Abi.View.Base.extend({
        tagName: "table",
        className: "table table-bordered table-striped calendar",
        initialize: function () {
            this.from = this.options.from || mom()
            this.to = this.from.clone().add("d", 28)
            this.collection = Abi.Collection.Calendar.range(this.from, this.to)
        },
        templateHead: function () {
            var html = "<thead>",
                moment = mom()
            for (var i = 0; i < 7; i++) {
                html += "<th>" + moment.format("dddd") + "</th>"
                moment.add("d", 1)
            }
            html += "</thead>"
            return html
        },
        render: function () {
            this.$el.html(this.templateHead()).append("<tbody></tbody>")
            return this
        }
    })

})