(function () {
	var ROUTE = "abiball";
	
	Abi.Model.Abiball = Abi.Model.Base.extend({
		urlRoot: "User/abiball/"
	}, {
		instance: Abi.Singleton()
	})
	Abi.View.Abiball = Abi.View.Base.extend({
		events: {
			"change .ball": function (event) {
				var $target = $(event.currentTarget)
				this.model.save({
					vote: $target.val()
				})
			}
		},
		initialize: function () {
			this.model = Abi.Model.Abiball.instance({
				change: this.load
			}, this)
			this.loaded = this.model.has("vote")
			this.options = {
				1: "Nicht abgestimmt",
				2: "Unter den gegebenen Voraussetzungen boykottiere ich den Abiball",
				3: "Ich werde die Einlage zahlen",
				4: "Ich gehe unter keinen Umständen zum Abiball"
			}
		},
		render: function () {
			if (this.loaded) {
				var i, op, html = "<form><fieldset><legend>Deine Meinung zum Abiball</legend>"
				for (i in this.options) {
					op = this.options[i]
					html += "<label><input type='radio' name='ball' class='ball' value='" + i + "' /> " + op + "</label>"
				}
				html += "</fieldset></form>"
				html += "<div><span class='label label-info'>Wichtig!</span> Diese Umfrage ist natürlich nicht verbindlich, es wird jedoch um eine ehrliche Antwort gebeten!</div>"
				this.$el.html(html)
				this.model.on("change", this.changeView, this)
				this.changeView()
			} else {
				this.$el.text("Lädt...")
			}
			return this
		},
		load: function () {
			if (this.model.has("vote")) {
				this.loaded = true
				this.model.off("change", this.load, this)
				this.render()
				// Apply current value
			}
		},
		changeView: function () {
			this.$(".ball[value='" + this.model.get("vote") + "']").prop("checked", true)
		}
	})
	
	App.router.route(ROUTE, ROUTE, function () {
		App.setView(new Abi.View.Abiball())
	})
	
	App.addNavigationItem(ROUTE, "Umfrage zum Abiball")

})()