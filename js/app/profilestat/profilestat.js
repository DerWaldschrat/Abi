(function () {
	
	var _cache = {}
	
	function $profile (id) {
		if (_cache[id]) return _cache
		return $.ajax(ROOT + "ProfileResult/index.php?" + id, {
			
		})
	}
	
	function $e (text) {
		return text == null ? "" : _.escape(text)
	}
	
	App.router.route("profilestat(/:profile)", "profilestat", function (id) {
		if (userList.get(id)) {
			App.setView(new Abi.View.ProfileResult({
				model: userList.get(id)
			}))
		} else {
			App.setView(new Abi.View.ProfileResultOverview())
		}
	})
	
	Abi.View.ProfileResultOverview = Backbone.View.extend({
		events: {
			"click a": "navigate"
		},
		navigate: function (event) {
			event.preventDefault()
			var $target = $(event.currentTarget)
			App.router.navigate("profilestat/" + $target.attr("href"), {
				trigger: true
			})
		},
		initialize: function () {
			this._sorter = this.sorter.name;
		},
		render: function () {
			var html = "<ul>"
			, list = userList.sortBy(this._sorter)
			_.each(list, function (model) {
				html += "<li><a href='" + model.id + "'>" + model.escape("nachname") + ", " + model.escape("vorname") + "</a></li>";
			})
			html += "</ul>"
			this.$el.html(html)
			return this
		},
		sorter: {
			name: function (model) {
				return model.escape("nachname").toLowerCase() + " " + model.escape("vorname").toLowerCase()
			}
		}
	})
	
	Abi.View.ProfileResult = Backbone.View.extend({
		initialize: function () {
		},
		render: function () {
			this.$el.html("Lädt...")
			var self = this
			$profile(this.model.id).done(function (data) {
				self.create(data)
			}).fail(function () {
				alert("Sorry, es ist ein Fehler aufgetreten")
				App.router.navigate("profilestat", {
					trigger: true
				})
			})
			return this
		},
		create: function (data) {
			var red = data.publish_ok == 0 ? " style='color: red; '" : ""
			var html = "<h1" + red + ">" + this.model.escape("vorname") + " " + this.model.escape("nachname") + "</h1>"
			// First iterate over images
			var imageExists = {}
			for (var i = 0, len = data.images.length, curr; i < len; i++) {
				curr = data.images[i];
				html += "<div style='position: relative;'><img src='" + ROOT + "__images/" + curr.name +  "' />"
				html += "<div style='border: 4px solid orange; width: 60px; height: 60px;position: absolute; top: " + (curr.y - 34) + "px; left: " + (curr.x - 34) + "px'></div>"
				html += "</div>"
				imageExists[curr.imageid] = true
			}
			html += "<div>"
			// Then iterate over markless images
			for (var i = 0, len = data.markless.length, curr; i < len; i++) {
				curr = data.markless[i];
				if (imageExists[curr.imageid]) continue;
				html += "<img src='" + ROOT + "__images/" + curr.name + "' />";
			}
			html += "<h3>Geburtstag</h3>"
			+ $e(data.geburtstag)
			+ "<h3>Wohnort</h3>"
			+ $e(data.strasse) + ", " + $e(data.wohnort)
			+ "<h3>Abiturfächer</h3>"
			+ $e(data.abi_schriftlich) + ", " + $e(data.abi_muendlich_1) + ", " + $e(data.abi_muendlich_2)
			+ "<h3>Seminare</h3>"
			+ $e(data.semi_thema) + " im Seminar " + $e(data.w_semi) + ", " + $e(data.p_semi)
			+ "<h3>Positiv<h3>"
			+ $e(data.positiv)
			+ "<h3>Negativ</h3>"
			+ $e(data.negativ)
			+ "<h3>Danksagung"
			+ $e(data.danksagung)
			+ "<h3>Zukunft</h3>"
			+ $e(data.zukunft)
			+ "<h3>Kommentare</h3>"
			+ "<ul>"
			// Then iterate over comments
			for (var i = 0, len = data.comments.length, curr; i < len; i++) {
				curr = data.comments[i]
				html += "<li>" + $e(curr) + "</li>"
			}
			html += "</ul>"
			html += "</div>"
			this.$el.html(html)
		}
	})


})()