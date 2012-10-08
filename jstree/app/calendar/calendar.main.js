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

    Abi.Model.Term = Abi.Model.Base.extend({

    })

    Abi.Collection.Calendar = Abi.Collection.Base.extend({
        urlRoot: "Calendar/",
        model: Abi.Model.Term,
        initialize: function (models, options) {
            this.from = options.from
            this.to = options.to
        },
        url: function () {
            return ROOT + _.result(this, "urlRoot") + "index.php?from=" + encodeURIComponent(asDate(this.from)) + "&to=" + encodeURIComponent(asDate(this.to))
        }
    })

    // Cache all calendar collections in this var
    var cache = {}
    Abi.Collection.Calendar.range = function (from, to, events, context, options) {
        options || (options = {})
        var hash = _hashRange(from, to),
            iscached = cache[hash] instanceof Abi.Collection.Calendar,
            collection = iscached ? cache[hash] : (cache[hash] = new Abi.Collection.Calendar([], {
                from: from,
                to: to
            })),
            i
        for (i in events) {
            collection.on(i, events[i], context)
        }
        !iscached && collection.fetch(options)
        return collection
    }

    Abi.View.CalendarMainView = Abi.View.Base.extend({
        tagName: "table",
        className: "table table-bordered table-striped calendar",
        initialize: function () {
            this.from = this.options.from || mom()
            this.to = this.from.clone().add("d", 28)
            this.collection = Abi.Collection.Calendar.range(this.from, this.to, {
                reset: this.reset
            }, this)
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
        templateBody: function () {
            return "<tbody></tbody>";
        },
        render: function () {
            this.$el.html(this.templateHead()).append(this.templateBody())
            return this
        },
        reset: function () {
            this.$el.find("tbody").replaceWith(this.templateBody())
        }
    })

})