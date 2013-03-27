(function () {

	Abi.Model.Teacher = Backbone.Model.extend({
		idAttribute: "teacherid",
		initialize: function () {
			this.text = this.label = this.get("name")
			this.value = this.id
		}
	})
	
	Abi.Collection.Teachers = Backbone.Collection.extend({
		model: Abi.Model.Teacher,
		urlRoot: "Award/Teacher/list/"
	}, {
		instance: Backbone.Singleton()
	})
	
	Abi.Model.TeacherAward = Backbone.Model.extend({
		idAttribute: "awardid",
		urlRoot: "Award/Teacher/"
	})
	
	_.extend(Abi.Model.TeacherAward.prototype, Abi.Mixin.DelaySave)
	
	Abi.Collection.TeacherAwards = Backbone.Collection.extend({
		model: Abi.Model.TeacherAward,
		urlRoot: "Award/Teacher/"
	}, {
		instance: Backbone.Singleton()
	})
	
	var ROUTE = "teacheraward"
	App.router.route(ROUTE, ROUTE, function () {
		App.setView(new Abi.View.TeacherAward())
	})
	
	var teacherList = Abi.Collection.Teachers.instance()
	
	Abi.View.TeacherAward = Backbone.View.extend({
		_subview: ["_autocompletes"],
		events: {
			"focusin input": "createAutocomplete"
		},
		initialize: function () {
			this.collection = Abi.Collection.TeacherAwards.instance()
			this.listenTo(this.collection, "reset", this.render)
			this.listenTo(teacherList, "reset", this.render)
			this._autocompletes = {}
			this._delay = 800
		},
		render: function () {
			var html = "<table class='table table-bordered table-striped'>"
			+ "<thead>"
				+ "<tr><th>Kategorie</th><th>Erster</th><th>Zweiter</th><th>Dritter</th>"
			+ "</thead>"
			+ "<tbody>"
			+ this.templateBody()
			+ "</tbody>"
			+ "</table>"
			this.$el.html(html)
			return this
			
		},
		templateBody: function () {
			var html = ""
			for (var i = 0, len = this.collection.models.length, curr; i < len; i++) {
				curr = this.collection.models[i];
				html += this.templateRow(curr)
			}
			return html
		},
		templateRow: function(model) {
			return "<tr>"
			+ "<td>" + model.escape("title") + "</td>"
			+ this.templateCell(model, "firstid")
			+ this.templateCell(model, "secondid")
			+ this.templateCell(model, "thirdid")
			+ "</tr>"
		},
		templateCell: function (model, type) {
			var teacher = teacherList.get(model.get(type))
			return "<td><input type='text' data-id='" + model.id + "' value='" + (teacher ? teacher.escape("name") : "") + "' data-type='" + type + "' /></td>"
		},
		createAutocomplete: function (event) {
			var $input = $(event.currentTarget)
			, type = $input.attr("data-type")
			, id = $input.attr("data-id")
			, hash = type + id
			, model = this.collection.get(id)
			, startid = model.get(type)
			if (!this._autocompletes[hash]) {
				var auto = this._autocompletes[hash] = new Abi.View.AutocompleteUser({
					collection: teacherList,
					el: event.currentTarget,
					startid: startid,
					model: model
				})
				auto.value(startid)
				this.listenTo(auto, "selected", this[type + "Change"])
			}
		},
		firstidChange: function (id, el, model) {
			if (model.get("secondid") != id && model.get("thirdid") != id) {
				model.set("firstid", id)
				model.delaySave(this._delay)
			}
		},
		secondidChange: function (id, el, model) {
			if (model.get("firstid") != id && model.get("thirdid") != id) {
				model.set("secondid", id)
				model.delaySave(this._delay)
			}
		},
		thirdidChange: function (id, el, model) {
			if (model.get("firstid") != id && model.get("secondid") != id) {
				model.set("thirdid", id)
				model.delaySave(this._delay)
			}
		}
	})
	
})()