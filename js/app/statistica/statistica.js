steal("js/highcharts").then(function () {

    // Override Navigation
    App.router.route("statistica(/:stats)", "statistica", function (stats) {
        App.StatsRoute(stats)
    })

    // Cache queries, this can get quite big, but dont mind
    var _queryCache = {}

    // Perform a predefined query, optionally with one param
    function $query(name, param) {
        var _hash = "h" + name + param
        if (_queryCache[_hash]) return _queryCache[_hash];
        return (_queryCache[_hash] = $.ajax(ROOT + "Stats/", {
            data: {
                query: name,
                param: param
            }
        }))
    }

    // Cache map transforms
    var _mapCache = []
    // Transforms an array with objects into a key -> object map
    function $toMap(arr, key) {
        if (arr.__expando) return _mapCache[arr.__expando]
        key || (key = "id")
        var map = {}, i = 0, len = arr.length
        for (; i < len; i++) {
            map[arr[i][key]] = arr[i]
        }
        arr.__expando = _mapCache.length;
        _mapCache.push(map)
        return map
    }

    // Casts from string to integer
    function $num (num) {
        return parseInt(num, 10)
    }

    function $pack(arr) {
        if (_.isArray(arr)) return arr;
        return [arr]
    }

    // Creates a chart, depending on multiple queries
    function $chart(sql, process, options) {
        var def, finished = {};
        // Allow multiple queries
        if (_.isArray(sql)) {
            var result = []
            for (var i = 0, len = sql.length, curr; i < len; i++) {
                result.push($query.apply(this, $pack(sql[i])))
            }
            // Deferred for all queries
            def = $.when.apply(null, result)
        } else {
            def = $query.apply(this, $pack(sql))
        }
        def.done(function () {
            $.extend(true, options, process.apply(this, arguments))
            finished.chart = new Highcharts.Chart(options)

        })
        return finished
    }

    function $fromIndex(i) {
        return function (el) {
            return el[i]
        }
    }

    function noop(){return {}}

    // simplifies the process function, takes a series which will be filled with the right data
    function $process(process, series, fn) {
        fn || (fn = noop)
        return function () {
            // Get simplified result from process
            // Looks like [[category, value 1, value 2],[category, value 1, value 2], [category, value 1, value 2]] which makes it easy to have a multi-query chart
            var result = process.apply(this, arguments)
                , categories = _.map(result, $fromIndex(0))
            for (var i = 0, len = series.length; i < len; i++) {
                series[i].data = _.map(result, $fromIndex(i + 1))
            }
            return $.extend(true, {
                series: series,
                xAxis: {
                    categories: categories
                },
                chart: {
                    height: 20 * result.length + 100
                }
            }, fn.apply(this, arguments))
        }
    }

    var charts = {
        Award: function (type, id, el) {
            var colors = type == "awardMale" ? ["#4572A7"] : ["#AA4643"]
            return $chart(["categories", [type, id]], $process(function (categories, data) {
                return _.map(data[0], function (obj) {
                    var user = userList.get(obj.id)
                    return [user ? (user.get("vorname") + " " + user.get("nachname") ) : "Unbekannter User", $num(obj.cm)]
                })
            }, [{
                name: "Erhaltene Stimmen"
            }], function (categories) {
                var map = $toMap(categories[0]);
                return {
                    title: {
                        text: map[id].title
                    }
                }
            }), {
                chart: {
                    renderTo: el,
                    type: "bar"
                },
                yAxis: {
                    title: "Anzahl der Stimmen"
                },
                colors: colors
            })
        },
        CommentCount: function (el) {
            return $chart(["commentFrom", "commentTo"], $process(function (from, to) {
                var f = $toMap(from[0]),
                    t = $toMap(to[0])

                // Simplifies a bit because userList is loaded
                return userList.map(function (user) {
                    return [user.get("vorname") + " " + user.get("nachname"), f[user.id] ? $num(f[user.id].fc) : 0, t[user.id] ? $num(t[user.id].tc) : 0]
                })
            }, [{
                name: "Kommentare geschrieben"
            }, {
                name: "Kommentare erhalten"
            }], function () {
                return {
                    chart: {
                        height: 40 * userList.length + 100
                    }
                }
            }), {
                chart: {
                    renderTo: el,
                    type: "bar"
                },
                yAxis: {
                    title: "Anzahl der Kommentare"
                },
                title: {
                    text: "Anzahl der Kommentare"
                }
            })
        }
    }


    Abi.View.ChartAwards = Backbone.View.extend({
        events: {
            "change .chartAwardSelect": "change"
        },
        initialize: function () {
            var div = "<div />"
            this.male = $(div)
            this.female = $(div)
            this.list = $(div)
            this.maleChart = null
            this.femaleChart = null
            this.active = -1
            $query("categories").done(_.bind(this.loaded, this))
        },
        render: function () {
            this.$el.append(this.list).append(this.male).append(this.female)
            return this
        },
        change: function (event) {
            var $target = $(event.currentTarget)
            this.active = $num($target.val())
            this.removeCharts()
            if (this.active == -1) {
                this.maleChart = null
                this.femaleChart = null
            } else {
                this.maleChart = charts.Award("awardMale", this.active, this.male[0])
                this.femaleChart = charts.Award("awardFemale", this.active, this.female[0])
            }
        },
        remove: function () {
            this.male = null
            this.female = null
            this.list = null
            this.removeCharts()
            return Backbone.View.prototype.remove.apply(this, arguments)
        },
        removeCharts: function () {
            this.maleChart && this.maleChart.chart && this.maleChart.chart.destroy()
            this.femaleChart && this.femaleChart.chart && this.femaleChart.chart.destroy()
        },
        loaded: function (categories) {
            this.categories = $toMap(categories)
            this.makeList()
        },
        makeList: function () {
            var i, curr, html = "<select class='chartAwardSelect'><option value='-1'>Wähle...</option>"
            for(i in this.categories) {
                curr = this.categories[i]
                html += "<option value='" + curr.id + "'>" + _.escape(curr.title) + "</option>"
            }
            html += "</select>"
            this.list.html(html)
        }
    });

    Abi.View.ChartCommentCount = Backbone.View.extend({
        initialize: function () {
            this.chart = charts.CommentCount(this.el)
        },
        remove: function () {
            this.chart && this.chart.chart && this.chart.chart.destroy()
            return Backbone.View.prototype.remove.apply(this, arguments)
        }
    })



    Abi.View.Chart = Backbone.View.extend({
        _subview: ["tabview"],
        events: {
            "click .nav a": "goToTab"
        },
        goToTab: function (event) {
            event.preventDefault()
            var $target = $(event.currentTarget)
            App.router.navigate($target.attr("href"), {
                trigger: true
            })
        },
        initialize: function () {
            // Stores a list of all tabs
            this.tabs = {}
            this.active = null
            this.tabview = null
        },
        addTab: function (id, title, fn) {
            this.tabs[id] = {
                title: title,
                fn: fn
            }
        },
        _getId: function (id) {
            return this.cid + id;
        },
        templateTab: function (id, title) {
            return "<li id='" + this._getId(id) + "'><a href='statistica/" + id + "'>" + title + "</a></li>"
        },
        setActive: function (id) {
            if (this.tabs[id]) {
                this.active = id
                return true
            }
            return false
        },
        applyActive: function () {
            if (!this.active) return
            var id = this.active
            this.$(".nav .active").removeClass("active")
            this.$("#" + this._getId(id)).addClass("active")
            this.tabview && this.tabview.remove()
            this.tabview = new this.tabs[id].fn
            this.$(".content").append(this.tabview.render().el)
        },
        render: function () {
            var html = "<ul class='nav nav-tabs no-print'>", i
            for (i in this.tabs) {
                html += this.templateTab(i, this.tabs[i].title)
            }
            html += "</ul>"
            html += "<div class='content'></div>"
            this.$el.html(html)
            this.applyActive()
            return this
        }
    })
    Abi.View.HelloWorld = Backbone.View.extend({
        render: function () {
            this.$el.text("Hier entstehen nach und nach die Auswertungstools, von denen ich einige aber erst nach dem Ende des Eintragens freigeben werde.")
            return this
        }
    })

    Abi.View.UserAlphabetic = Backbone.View.extend({
        initialize: function () {
            this.collection = userList
            this.listenTo(this.collection, "reset", this.render)
        },
        render: function () {
            var ordered = this.collection.sortBy(function (model) {
                return model.get("nachname").toLowerCase()
            })
            /*var html = "<table class='table table-bordered table-striped'>"
             + "<thead><tr>"
             + "<th>Nachname</th><th>Vorname</th>"
             + "</tr></thead>"
             + "<tbody>"
             for (var i = 0, len = ordered.length; i < len; i++) {
             html += "<tr><td>" + ordered[i].escape("nachname") + "</td><td>" + ordered[i].escape("vorname") + "</td></tr>"
             }
             html += "</tbody></table>"*/
            var arr = ordered.map(function (el) {
                return el.escape("nachname") + " " + el.escape("vorname")
            })
            this.$el.text(arr.join(", ")).prepend("<h1>Alle Angemeldeten</h1>")
            return this
        }
    })

    Abi.View.AwardsAlphabetic = Backbone.View.extend({
        initialize: function () {
        },
        render: function () {
            var self = this
            $query("categories").done(function (data) {
                var arr = _.sortBy(data, function (model) {
                    return model.title
                })
                self.$el.text(_.map(arr, function (el) {
                    return el.title
                }).join(", ")).prepend("<h1>Alle Awards</h1>")
            })
            return this
        }
    })
	
	Abi.View.ImagePreview = Backbone.View.extend({
		initialize: function () {
		},
		render: function () {
			var self = this
			$query("imagePreview").done(function (data) {
				var html = "<ul class='thumbnails imagination'>" + (_.map(data, function (el) {
					var url = ROOT + "/__images/"
					return "<li><a class='thumbnail' href='" + url + el.name + "' target='_blank'><image src='" + url + "thumbs/" + el.name + "' /></a></li>"
				}).join("")) + "</ul>"
				self.$el.html(html)
			})
			return this
		}
	})

    // Main routing function
    App.StatsRoute = function (page) {
        // Make awards default page
        page || (page = "helloWorld")

        var view = App.view, set = false
        // When not on this page, create new view
        if (!(view instanceof Abi.View.Chart)) {
            set = true
            view = new Abi.View.Chart()
            view.addTab("helloWorld", "Was ist das?", Abi.View.HelloWorld)
            view.addTab("awards", "Awards", Abi.View.ChartAwards)
            view.addTab("commentCount", "Kommentare", Abi.View.ChartCommentCount)
			view.addTab("imagePreview", "Bildervorschau", Abi.View.ImagePreview)
            view.addTab("orderedUsers", "User alphabetisch", Abi.View.UserAlphabetic)
            view.addTab("orderedCategories", "Awards alphabetisch", Abi.View.AwardsAlphabetic)

        }
        view.setActive(page)
        // only apply new view when required
        if (set) {
            App.setView(view)
            // Only have to change active setting
        } else {
            view.applyActive()
        }
        // charts.Award("awardMale", 3, App.view.sub[0])
        // charts.Award("awardFemale", 3, App.view.sub2[0])
    }
})