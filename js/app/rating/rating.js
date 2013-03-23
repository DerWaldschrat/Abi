steal("js/app/rating/mainLessons.js").then(function () {
    var ROUTE = "rating"
	
	_.extend(Messages, {
		ratingSaveFailed: "Deine Bewertung konnte leider nicht gespeichert werden!",
		ratingSaveSucceed: "Deine Bewertung wurde erfolgreich gespeichert!"
	})

    App.router.route(ROUTE, ROUTE, function () {
        App.setView(new Abi.View.Rating())
    })

    Abi.Model.RatingUser = Backbone.Model.extend({
        initialize: function (attr, op) {
            this.set({
                german: op.fromUser.get("german"),
                math: op.fromUser.get("math"),
                userid: op.fromUser.id
            })
        },
        urlRoot: "Rating/Lessons/", // TODO
        idAttribute: "userid",
        // Clear values
        resetLessons: function () {
            this.save({
                math: '',
                german: ''
            })
        },
        resetMath: function () {
            this.save({
                math: ''
            })
        },
        setLessons: function (lesson) {
            var ret = false
            this.set({
                german: lesson.id
            })
            if (_.isArray(lesson.math)) {
                ret = lesson.math
                this.save()
            } else {
                this.setMath(lesson.math)
            }
            return ret
        },
        setMath: function (math) {
            this.save({
                math: math
            })
        }
    })
	
	Abi.Model.RatingItem = Backbone.Model.extend({
		idAttribute: "ratingid",
		urlRoot: "Rating/"
	})
	
	Abi.Collection.RatingItems = Backbone.Collection.extend({
		urlRoot: "Rating/",
		model: Abi.Model.RatingItem,
		fromLesson: function (lesson) {
			return this.where({
				lesson: lesson
			})[0]
		}
	}, {
		instance: Backbone.Singleton()
	})

    Abi.View.Rating = Backbone.View.extend({
        events: {
            "change #selectGerman": "selectGerman",
            "change #selectMath": "selectMath",
			"click .saveRating": "saveRating"
        },
        initialize: function () {
            // User is this´ model
            this.model = new Abi.Model.RatingUser({}, {
                fromUser: App.user
            })
			this.collection = Abi.Collection.RatingItems.instance({
				reset: this.resetRating
			}, this)
        },
        template: function () {
            var html = "<form action='#'>" +
                "<fieldset class='buttonAndMessage'>" +
                    "<legend>Bewerte deine Kurse</legend>" +
                    "<div id='selectGermanContainer'></div>" +
                    "<div id='selectMathContainer'></div>" +
					"<div id='explanation' class='alert alert-info'>" +
					"<h4>Hinweis:</h3>" +
					"Vergib bitte Punktzahlen von 0 bis 15" +
					"</div>" +
                "</fieldset>" +
				"<div id='inputValues'></div>" +
                "</form>"
            return html
        },
        templateGermanSelect: function () {
            var html = "<select id='selectGerman'><option value=''>Wähle...</option>"
                , curr, i
            for (i in window.LESSONS) {
                curr = window.LESSONS[i]
                html += "<option value='" + i + "'>" + i + " bei " + curr.teacher +  "</option>"
            }
            html += "</select>"
            return html
        },
        templateMathSelect: function (lessons) {
            var html = "<select id='selectMath'><option value=''>Wähle...</option>"
                , i, curr
            for (i = 0, len = lessons.length; i < len; i++) {
                curr = lessons[i]
                html += "<option value='" + curr.id + "'>" + curr.id + " bei " + curr.teacher + "</option>"
            }
            html += "</select>"
            return html
        },
        findGerman: function() {
            return this.$("#selectGermanContainer")
        },
        findMath: function () {
            return this.$("#selectMathContainer")
        },
        findInput: function () {
            return this.$("#inputValues")
        },
        render: function () {
            this.$el.html(this.template())
            this.findGerman().html(this.templateGermanSelect())

            // Check for already loaded values
            var german = this.model.get("german")
            if (german) {
                this.findGerman().find("select").val(german)
                if (window.LESSONS[german] && _.isArray(window.LESSONS[german].math)) {
                    this.findMath().html(this.templateMathSelect(window.LESSONS[german].math))
                    var math = this.model.get("math")
                    if (math) {
                        this.findMath().find("select").val(math)
                    }
                }
            }
            this.resetRating()
            return this
        },
        selectGerman: function (event) {
            var $target = $(event.currentTarget)
                , german = $target.val()
                , lesson = window.LESSONS[german]
                , updateMath
                , hideMath = true
            if (!lesson) {
                this.model.resetLessons()
            } else {
                var updateMath = this.model.setLessons(lesson)
            }
            if (updateMath) {
                this.findMath().html(this.templateMathSelect(updateMath))
                hideMath = false
            }
            if (hideMath) {
                this.findMath().html("")
            }
        },
        selectMath: function (event) {
            var $target = $(event.currentTarget)
                , math = $target.val()
            if (math) {
                this.model.setMath(math)
            } else {
                this.model.resetMath()
            }
        },

        templateInput: function() {
			// Which fields can be rated?
			var fields = {
				kursklima: {
					label: "Kursklima"
				},
				zusammenhalt: {
					label: "Zusammenhalt"
				},
				kreativitaet: {
					label: "Kreativität"
				},
				fairness: {
					label: "Fairness"
				},
				motivation: {
					label: "Motivation"
				},
				fachkompetenz: {
					label: "Fachkompetenz"
				}
			}
			, types = {
				german: {
					label: "Deutsch"
				},
				math: {
					label: "Mathematik"
				},
				history: {
					label: "Geschichte"
				}
			}
			, html = ""
			, typei, fieldi, type, field, model
			for (typei in types) {
				type = types[typei]
				html += "<fieldset class='control-group'>"
				+ "<legend>" + type.label + "</legend>"
				model = this.collection.fromLesson(typei)
				for (fieldi in fields) {
					field = fields[fieldi]
					html += "<label class='control-label'>"
					+ "<input type='text' value='" + (model ? (model.get(fieldi) == -1 || typeof model.get(fieldi) === 'undefined' ? "" : model.get(fieldi)) : "") + "' class='" + fieldi + "' name='" + fieldi + "' /> "
					+ field.label 
					+ "</label>"
				}
				html += "<div class='control-group' id='" + typei + "Message'><input class='saveRating btn' data-lesson='" + typei + "' type='button' value='Speichern' />"
				+ "<div class='help-block'></div></div>"
				+ "</fieldset>"
			}
			return html
        },
		resetRating: function () {
			this.findInput().html(this.templateInput())
		},
		saveRating: function(event) {
			var $target = $(event.currentTarget)
			, $fieldset = $target.closest("fieldset")
			, lesson = $target.attr("data-lesson")
			, fields = [
				"kursklima", 
				"zusammenhalt",
				"kreativitaet",
				"fairness",
				"motivation",
				"fachkompetenz"
			]
			, values = {}
			, model
			, isNew = false
			// Receive values
			for (var i = 0, len = fields.length; i < len; i++) {
				values[fields[i]] = this._receive($fieldset, fields[i])
			}
			// Write back changed values
			this._restore($fieldset, values)
			
			model = this.collection.fromLesson(lesson)
			// Need to create a new model
			if (!model) {
				model = new Abi.Model.RatingItem({
					lesson: lesson
				})
				isNew = true
			}
			console.log(model.cid)
			this.listenTo(model, "sync", isNew ? this.newSync : this.sync)
				.listenTo(model, "error", this.error)
			model.save(values)
		},
		_receive: function ($fieldset, name) {
			var val = parseInt($fieldset.find("." + name).val(), 10)
			return _.isNaN(val) ? -1 : 
				(val < 0 ? 0 : 
				(val > 15 ? 15 : val))
		},
		_restore: function ($fieldset, values) {
			var i
			for (i in values) {
				$fieldset.find("." + i).val(values[i])
			}
		},
		newSync: function (model, resp, op) {
			this.collection.add(model)
			this.sync(model, resp, op)
		},
		sync: function (model) {
			this.modelMessage("ratingSaveSucceed", model, true)
			this.stopListening(model)
		},
		error: function (model) {
			this.modelMessage("ratingSaveFailed", model)
			this.stopListening(model)
		},
		modelMessage: function (message, model, green) {
			var message = App.message(message)
			, $el = this.$("#" + model.get("lesson") + "Message")
			$el.removeClass("success error").addClass(green ? "success" : "error")
			$el.find(".help-block").text(message)
		}
    })
})