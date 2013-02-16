steal("js/app/rating/mainLessons.js").then(function () {
    var ROUTE = "rating"

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

    Abi.View.Rating = Backbone.View.extend({
        events: {
            "change #selectGerman": "selectGerman",
            "change #selectMath": "selectMath"
        },
        initialize: function () {
            // User is this´ model
            this.model = new Abi.Model.RatingUser({}, {
                fromUser: App.user
            })
        },
        template: function () {
            var html = "<form action='#'>" +
                "<fieldset>" +
                    "<legend>Bewerte deine Kurse</legend>" +
                    "<div id='selectGermanContainer'></div>" +
                    "<div id='selectMathContainer'></div>" +
                    "<div id='inputValues'></div>" +
                "</fieldset>" +
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
            alert("render")
            this.$el.html(this.template())
            this.findGerman().html(this.templateGermanSelect())

            // Check for already loaded values
            var german = this.model.get("german")
            if (german) {
                this.findGerman().find("select").val(german)
                if (_.isArray(window.LESSONS[german].math)) {
                    this.findMath().html(this.templateMathSelect(window.LESSONS[german].math))
                    var math = this.model.get("math")
                    if (math) {
                        this.findMath().find("select").val(math)
                    }
                }
            }
            this.findInput().html(this.templateInput())
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

        }
    })
})