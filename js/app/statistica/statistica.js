steal("js/highcharts", "js/app/data/items.js").then(function () {

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
	
	function $collectQueries() {
		var len = arguments.length,
		result = [],
		def
		for (var i = 0; i < len; i++) {
			result.push($query.apply(this, $pack(arguments[i])))
		}
		// Deferred for all queries
		def = $.when.apply(null, result)
		return def
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
        },
		TeacherAward: function (id, el) {
			return $chart(["teacherCategories", "teacherList", ["teacherAwardFirst", id], ["teacherAwardSecond", id], ["teacherAwardThird", id]], $process(
				function (categories, list, fi, se, thi) {
					var teacher = $toMap(list[0])
					, teacherCount = {}
					, put = function (el) {
						if (teacherCount[el.id]) {
							teacherCount[el.id] += el.sum
						} else {
							teacherCount[el.id] = el.sum
						}
					},
					first = _.map(fi[0], function (el) {
						return {
							id: el.id,
							sum: $num(el.cf) * 3
						}
					}),
					second = _.map(se[0], function (el) {
						return {
							id: el.id,
							sum: $num(el.cs) * 2
						}
					}),
					third = _.map(thi[0], function (el) {
						return {
							id: el.id,
							sum: $num(el.ct)
						}
					})
					_.each(first, put)
					_.each(second, put)
					_.each(third, put)
					var i, curr, result = []
					for (i in teacherCount) {
						curr = teacherCount[i]
						result.push([teacher[i].name, curr])
					}
					return result
				}, [{
					name: "Erhaltene Stimmen"
				}], function (categories) {
					var cat = $toMap(categories[0])
					return {
						title: {
							text: cat[id].title
						}
					}
				})
			, {
				chart: {
					renderTo: el,
					type: "bar"
				},
				yAxis: {
					title: "Anzahl der Stimmen"
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
	
	Abi.View.ChartTeacherAward = Backbone.View.extend({
		events: {
			"change .chartTeacherAwardSelect": "change"
		},
		initialize: function () {
			var div = "<div />"
			this.dom = $(div)
			this.list = $(div)
			this.chart = null
			this.active = -1
			$query("teacherCategories").done(_.bind(this.loaded, this))
		},
		change: function (event) {
			var $target = $(event.currentTarget)
            this.active = $num($target.val())
            this.removeChart()
            if (this.active == -1) {
				this.chart = null
			} else {
				this.chart = charts.TeacherAward(this.active, this.dom[0])
			}
		},
		render: function () {
			this.$el.append(this.list).append(this.dom)
			return this
		},
		remove: function () {
			this.dom = null
			this.list = null
			this.removeChart()
			return Backbone.View.prototype.remove.apply(this, arguments)
		},
		removeChart: function () {
			this.chart && this.chart.chart && this.chart.chart.destroy()
			this.chart = null
		},
		loaded: function (categories) {
			this.categories = $toMap(categories)
			this.makeList()
		},
		makeList: function () {
			var i, curr, html = "<select class='chartTeacherAwardSelect'><option value='-1'>Wähle...</option>"
            for(i in this.categories) {
                curr = this.categories[i]
                html += "<option value='" + curr.id + "'>" + _.escape(curr.title) + "</option>"
            }
            html += "</select>"
            this.list.html(html)
		}
	})

    Abi.View.ChartCommentCount = Backbone.View.extend({
        initialize: function () {
            this.chart = charts.CommentCount(this.el)
        },
        remove: function () {
            this.chart && this.chart.chart && this.chart.chart.destroy()
            return Backbone.View.prototype.remove.apply(this, arguments)
        }
    })
	
	Abi.View.AverageUser = Backbone.View.extend({
		initialize: function () {
			var self = this, args = []
			this.loaded = false
			for (var i = 0, len = ITEMS.length; i < len; i++) {
				args.push(["data", ITEMS[i].category])
			}
			this.dom = $("<div />")
			$collectQueries.apply(this, args).done(function () {
				var result = []
				for (var i = 0, len = arguments.length; i < len; i++) {
					result.push(arguments[i][0])
				}
				self.load.apply(self, result)
			})
		},
		render: function () {
			this.$el.append(this.dom)
			return this
		},
		load: function (size, mass, siblings, cigarettes, virgin, beer, coffee, sleep, tv, online, missed, late, fine, semiWork, semiStart, shoes, pocketMoney, mobileTaken) {
			var html = "<h1>Ein Durchschnitt unseres Jahrgangs</h1>"
			+ "<table class='table table-bordered table-striped'>"
			+ "<thead><tr><th>M</th><th>Kategorie</th><th>F</th></tr></thead><tbody>"
			
			// Ok, we have to generate each filter-map-reduce individually
			// Do render each item individually, too
			
			// Some default filters, maps and reduces
			var filter = function (el) {
				return !_.isNaN(el)
			}, 
			filterProst = function (el) {
				return filter(el) && el < 50
			},
			filterDay = function (el) {
				return filter(el) && el <= 24
			},
			reduce = function (memo, item) {
				return memo + item;
			},
			map = function (el) {
				var num = $num(el.value)
				return num
			},
			mapFloat = function (el) {
				var num = parseFloat(el.value)
				return num
			},
			finish = function (list, reduce) {
				return reduce / list.size()
			}
			
			// First size
			html += this.templateRow(this.makeResult(size, function (el) {
				var num = $num(el.value)
				if (num < 100) {
					return parseFloat(el.value) * 100
				}
				return num
			}, filter, reduce, 0, finish), 1)
			// Next mass
			html += this.templateRow(this.makeResult(mass, map, filter, reduce, 0, finish), 2)
			// Siblings
			html += this.templateRow(this.makeResult(siblings, map, filter, reduce, 0, finish), 3)
			// Cigarettes
			html += this.templateRow(this.makeResult(cigarettes, map, filter, reduce, 0, finish), 4)
			// Virginity
			html += this.templateRow(this.makeResult(virgin, function (el) {
				if (el.value === "0") return 0;
				if (el.value === "1") return 1;
				return -1
			}, function (el) {
				return el !== -1
			}, reduce, 0, function (list, reduce) {
				return (reduce / list.size() * 100) + "%"
			}), 5)
			// Beer
			html += this.templateRow(this.makeResult(beer, mapFloat, filterProst, reduce, 0, finish), 6)
			// Coffee
			html += this.templateRow(this.makeResult(coffee, mapFloat, filterProst, reduce, 0, finish), 7)
			// Sleep
			html += this.templateRow(this.makeResult(sleep, mapFloat, filterDay, reduce, 0, finish), 8)
			// TV
			html += this.templateRow(this.makeResult(tv, mapFloat, filterDay, reduce, 0, finish), 9)
			// Online
			html += this.templateRow(this.makeResult(online, mapFloat, filterDay, reduce, 0, finish), 10)
			// Missed lessons
			html += this.templateRow(this.makeResult(missed, mapFloat, filter, reduce, 0, finish), 11)
			// Late
			html += this.templateRow(this.makeResult(late, mapFloat, filter, reduce, 0, finish), 12)
			// Fines
			html += this.templateRow(this.makeResult(fine, map, filter, reduce, 0, finish), 13)
			// Work on semi
			html += this.templateRow(this.makeResult(semiWork, map, function (el) {
				return filter(el) && el < 1000
			}, reduce, 0, finish), 14)
			// Start with semi
			html += this.templateRow(this.makeResult(semiStart, mapFloat, filter, reduce, 0, finish), 15)
			// Shoe size
			html += this.templateRow(this.makeResult(shoes, map, function (el) {
				return filter(el) && el < 60 && el > 20
			}, reduce, 0, finish), 16)
			// Pocket money
			html += this.templateRow(this.makeResult(pocketMoney, mapFloat, filter, reduce, 0, finish), 17)
			// Mobile phone taken by teacher
			html += this.templateRow(this.makeResult(mobileTaken, map, filter, reduce, 0, finish), 18)
			html += "</tbody></table>"
			this.dom.html(html)
			return this
		},
		templateRow: function (result, index) {
			var item = ITEMS.get(index)
			return "<tr><td>" + result.male +  "</td><td>" + item.name + (item.unit ? " in " + item.unit : "") + "</td><td>" + result.female + "</td></tr>"
		},
		takeMale: function (data) {
			return _.filter(data, function (el) {
				return userList.get(el.userid).get("geschlecht") === "male"
			})
		},
		takeFemale: function (data) {
			return _.filter(data, function (el) {
				return userList.get(el.userid).get("geschlecht") === "female"
			})
		},
		makeResult: function(rawData, map, filter, reduce, init, finish) {
			var listMale = _(this.takeMale(rawData)).map(map).filter(filter)
			, resultMale = finish(listMale, listMale.reduce(reduce))
			var listFemale = _(this.takeFemale(rawData)).map(map).filter(filter)
			, resultFemale = finish(listFemale, listFemale.reduce(reduce, init))
			return {
				male: resultMale,
				female: resultFemale
			}
		},
		remove: function () {
			this.dom.remove()
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
	
	Abi.View.QuoteResultView = Backbone.View.extend({
		initialize: function () {
		},
		render: function () {
			var self = this
			$query("quotes").done(function (data) {
				var html = ""
				for (var i = 0, len = data.length, curr; i < len; i++) {
					curr = data[i]
					html += "<div class='well well-small'>" + _.escape(curr.content) + "</div>"
				}
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
			view.addTab("teacherAwards", "Lehrer-Awards", Abi.View.ChartTeacherAward)
            view.addTab("commentCount", "Kommentare", Abi.View.ChartCommentCount)
			view.addTab("averagePupil", "DurchschnittsabiturientIn", Abi.View.AverageUser)
			view.addTab("imagePreview", "Bildervorschau", Abi.View.ImagePreview)
            view.addTab("orderedUsers", "User alphabetisch", Abi.View.UserAlphabetic)
            view.addTab("orderedCategories", "Awards alphabetisch", Abi.View.AwardsAlphabetic)
			view.addTab("quotes", "Sprücheklopfer", Abi.View.QuoteResultView)

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