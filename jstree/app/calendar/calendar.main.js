// First fetch namedLessons to avoid rerendering in most cases
App.user.fetchNamedLessons()
steal("jstree/moment", "jstree/app/timetable/timetable.main.js").then(function () {
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
            // Cache results for first filter
            this._cache = cache
            this._filter = options.filter
        },
        url: function () {
            return ROOT + _.result(this, "urlRoot") + "index.php?from=" + encodeURIComponent(asDate(this.from)) + "&to=" + encodeURIComponent(asDate(this.to))
        },
        getByDate: function(date) {
            var chain = this._cache[date] || this.chain().filter(this._preFilter(date))
            return chain.filter(this._filter).value()
        },
        _preFilter: function (date) {
            return function (model) {
                return model.get("datum") == date
            }
        },
        reset: function () {
            // On each reset reset cache
            this._cache = {}
            return Abi.Collection.Base.prototype.reset.apply(this, arguments)
        }
    })

    // Cache all calendar collections in this var
    var cache = {}
    Abi.Collection.Calendar.range = function (from, to, filter, events, context, options) {
        options || (options = {})
        var hash = _hashRange(from, to),
            iscached = cache[hash] instanceof Abi.Collection.Calendar,
            collection = iscached ? cache[hash] : (cache[hash] = new Abi.Collection.Calendar([], {
                from: from,
                to: to,
                filter: filter
            })),
            i
        for (i in events) {
            collection.on(i, events[i], context)
        }
        !iscached && collection.fetch(options)
        return collection
    }

    Abi.View.CalendarMainView = Abi.View.Base.extend({
        events: {
            "click a.nav": "navigate"
        },
        navigate: function (event) {
            var $target = $(event.target)
            App.router.navigate($target.attr("href"), {
                trigger: true
            })
            event.preventDefault()
        },
        initialize: function () {
            this.from = mom(this.options.from) || mom()
            this.to = this.from.clone().add("d", 27)
            this.forInTime = this.from.clone().add("d", 28)
            this.backInTime = this.from.clone().subtract("d", 28)
            this.collection = Abi.Collection.Calendar.range(this.from, this.to, this._filter, {
                reset: this.reset
            }, this)
            // Always rerender when courses change
            App.user.on("change:namedLessons", this.changeNamedLessons, this)
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
            var str = "<tbody>", t = 0
            for (var i = 0; i < 4; i++) {
                str += "<tr>"
                for (var j = 0; j < 7; j++) {
                    str += "<td>" + this.templateListForDay(this.from.clone().add("d", t)) + "</td>"
                    t++
                }
                str += "</tr>"
            }
            str += "</tbody>"
            return str
        },
        templateListForDay: function (date) {
            var format = asDate(date)
                , str = "<span class='date'>" + asGermanDate(date) + "</span><ul>"
                , terms = this.collection.getByDate(format)
            for (var i = 0, len = terms.length, curr; i < len; i++) {
                curr = terms[i]
                str += "<li>" + curr.escape("title") + "</li>"
            }
            str += "</ul>"
            return str
        },
        templateTableBone: function () {
            return "<table class='table table-bordered table-striped calendar'></table>";
        },
        templateTimeLinks: function () {
            return "<a href='calendar/" + asDate(this.backInTime) + "' class='backInTime nav'>Frühere Termine</a> - <a href='calendar/" + asDate(this.forInTime) + "' class='forInTime nav'>Spätere Termine</a>";
        },
        render: function () {
            this.$el.html(this.templateTimeLinks() + this.templateTableBone())
            .find("table").html(this.templateHead()).append(this.templateBody())
            return this
        },
        changeNamedLessons: function () {
            this.reset()
        },
        reset: function () {
            this.$el.find("tbody").replaceWith(this.templateBody())
        },
        remove: function () {
            App.user.off("change:namedLessons", this.changeNamedLessons, this)
            return Abi.View.Base.prototype.remove.apply(this, arguments)
        },
        _filter: function (model) {
            var target = model.get("target")
            return target == "all" || App.user.get("namedLessons")[target] === 1
        }
    })

})