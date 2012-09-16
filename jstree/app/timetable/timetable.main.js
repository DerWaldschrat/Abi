/**
 * Created with JetBrains PhpStorm.
 * User: hauke
 * Date: 12.09.12
 * Time: 17:03
 * To change this template use File | Settings | File Templates.
 *
*/
(function () {


    /**
     * @class Abi.Model.Lesson
     */
    Abi.Model.Lesson = Abi.Model.Base.extend({
        urlRoot: "Timetable/",
        idAttribute: "kursid",
        is: function (id) {
            var arr = this.get("stunden")
            for (var i = 0, len = arr.length; i < len; i++) {
                if (arr[i] == id) return true
            }
            return false
        }
    })

    /**
     *
     * @class Abi.Collection.Lessons
     */
    Abi.Collection.Lessons = Abi.Collection.Base.extend({
        urlRoot:"Timetable/",
        model:Abi.Model.Lesson,
        initialize:function () {
            this.times = []
        },
        // Selects only lessons for the specific time
        // Lazy evaluated
        forTime:function (time) {
            if (this.times[time] != null) {
                return this.times[time]
            }
            this.times[time] = []
            for (var i = 0, len = this.models.length; i < len; i++) {
                if (this.models[i].is(time)) {
                    this.times[time].push(this.models[i])
                }
            }
            return this.times[time]
        }
    }, {
        instance:Abi.Singleton()
    })

    /**
     * @class Abi.Collection.StaticTimetable
     */
    Abi.Collection.StaticTimetable = function () {
        this._store = new Array(60)
        this._available = Abi.Collection.Lessons.instance()
        this._haveChanged = {}
    }

    _.extend(Abi.Collection.StaticTimetable.prototype, Backbone.Events, {
        get: function (day) {
            return this._store[day] !== -1 ? this._available.get(this._store[day]) : null;
        },
        set: function (id) {
            // Remove collisions
            this._removeCollisions(id)
            // Set new lesson
            this._set(id)
            this.trigger("change", this)
            this._haveChanged = {}
            return this
        },
        changed: function () {
            return this._haveChanged
        },
        _remove: function (day) {
            var model = this.get(day)
            // If no model is set for that day, just return
            if (!model) return this
            // Get every hour the model has
            var arr =  model.get("stunden")
            // Set every our in our store to -1
            for (var i = 0, len = arr.length; i < len; i++) {
                this._store[arr[i]] = this._haveChanged[arr[id]] = -1
            }
            return this
        },
        _removeCollisions: function (id) {
            // Get every hour the new model has
            var arr = this._available.get(id).get("stunden")
            // Iterate through all hours to remove each collision
            for (var i = 0, len = arr.length; i < len; i++) {
                this._remove(arr[i])
            }
            return this
        },
        _set: function(id) {
            var arr = this._available.get(id)
            for (var i = 0, len = arr.length; i < len; i++) {
                this._store[arr[i]] = this._haveChanged[arr[i]] = id
            }
            return this
        },
        toJSON: function () {
            return _.clone(this._store)
        },
        url: function () {
            return ROOT + "Timetable/me"
        },
        fetch: function (op) {
            var options = op ? _.clone(op) : {}
                , success = options.success
                , model = this
            options.success = function (resp) {
                model._store = model._haveChanged = resp
                if (success) {
                    success(model)
                } else {
                    model.trigger("change", model)
                }
                model._haveChanged = {}
            }
            options.error = Backbone.wrapError(options.error, model, options)
            return Backbone.sync.call(this, "read", this, options)
        },
        save: function () {
            var options = op ? _.clone(op) : {}
                , success = options.success
                , model = this
            options.success = function (resp) {
                if (success) {
                    success(model)
                } else {
                    model.trigger("sync", model)
                }
            }
            options.error = Backbone.wrapError(options.error, model, options)
            return Backbone.sync.call(this, "update", this, options)
        }
    });




    // Model events we will listen for in Timetable-View
    var eTimetableModel = {
    }

    var eTimeTableCollection = {

    }

    /**
     * @class Abi.View.Timetable
     * Should display the whole timetable
     */

    Abi.View.Timetable = Abi.View.Base.extend({
        events: {
            "submit .createNewLesson": "createNewLesson",
            "click #createNewLessonLegend": "toggleForm"
        },
        initialize: function () {
            this.collection = Abi.Collection.Lessons.instance()
            this._timeSettings = {
                hoursADay: 12,
                days: ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag"]

            }
            this.setSubviewStore("mainTable")
            this.mainTable = new Abi.View.TimetableMain({
                collection: this.collection,
                _timeSettings: this._timeSettings
            })
        },
        // Receive values from this
        // $(".lessonStunden:checked").map(function () {return parseInt($(this).val(), 10)})
        _chooseOfHour: function () {
            var html = ""
            for (var i = 0, len = this._timeSettings.hoursADay * this._timeSettings.days.length, mod, id; i < len; i++) {
                mod = i % this._timeSettings.hoursADay
                if (mod == 0) {
                    html += "<div>" + this._timeSettings.days[i / this._timeSettings.hoursADay] + "</div>"
                }
                mod += 1
                id = this.cid + i;
                html += "<label class='checkbox inline'>" + mod + ". Stunde<input type='checkbox' name='lessonStunden[]' class='lessonStunden' value='" + i + "' /></label>"
            }
            return html;
        },
        templateCreate: function () {
            return "<form class='createNewLesson' action='#'>" +
                "<fieldset>" +
                    "<legend class='pointer' id='createNewLessonLegend'>Neuen Kurs anlegen</legend>" +
                    "<div class='toggler hidden'>" +

                        "<label for='lessonKuerzel'>Das Kürzel (etwa wr3 oder m1):</label>" +
                        "<input type='text' id='lessonKuerzel' />" +
                        "<label for='lessonLehrer'>Der unterrichtende Lehrer:</label>" +
                        "<input type='text' id='lessonLehrer' />" +
                        "<label for='lessonFach'>Das Fach des Kurses</label>" +
                        "<input type='text' id='lessonFach' />" +
                        "<div>Die Stunden:</div>" +
                        this._chooseOfHour() +
                    "</div>" +
                "</fieldset>" +
                "<fieldset class='buttonAndMessage control-group toggler hidden'>" +
                    "<input type='submit' value='Neuen Kurs anlegen' class='btn' />" +
                    "<div class='statusField help-block'></div>" +
                "</fieldset>" +
                "</form>"
        },
        createNewLesson:function() {
            var stunden = []
            this.$(".lessonStunden:checked").each(function () {
                stunden.push(parseInt($(this).val(), 10))
            })
            console.log(stunden);
            var lesson = new Abi.Model.Lesson({
                kuerzel: $("#lessonKuerzel").val(),
                lehrer: $("#lessonLehrer").val(),
                fach: $("#lessonFach").val(),
                stunden: stunden
            })
            lesson.on("sync", this.newModelSaved, this).on("error", this.newModelFailed, this)
            this.model = lesson
            lesson.save()
            return false;
        },
        newModelSaved: function () {
            this.message("lessonSaveSucceed", true)
            this.model.off()
            this.$(".createNewLesson input:text").val("")
            this.$(".createNewLesson input:checkbox").prop("checked", false);
            this.collection.add(this.model)
        },
        newModelFailed: function (model, error) {
            this.message(error)
            console.log(error)
            this.model.off()
        },
        toggleForm: function () {
            this.$el.find(".createNewLesson .toggler").toggleClass('hidden')
        },
        render: function () {
            this.$el.html(this.templateCreate())
                .append(this.mainTable.render().el)
            return this
        }
    })

    /**
     * @class Abi.View.TimetableMain
     * The class which displays the real table
     */
    Abi.View.TimetableMain = Abi.View.Base.extend({
        tagName: "table",
        className: "table table-bordered",
        events: {
            "click #toggleEditMode": "toggleEditMode"
        },
        initialize: function () {
            this._timeSettings = this.options._timeSettings
            this.staticFields = new Abi.Collection.StaticTimetable()
            this.editMode = false;
            this.buttonBehaviour = {
                no: {
                    text: "Bearbeite",
                    title: "Bearbeite deinen Stundenplan"
                },
                yes: {
                    text: "Speichere",
                    title: "Speichere deine eben getroffenen Änderungen"
                }
            }
            // The data cell body template renderer
            this.bodyEditMode = {
                no: function (i, j) {
                    return "<td>" + (i + j * this._timeSettings.hoursADay)  + "</td>";
                },
                yes: function (i, j) {
                    return "<td>" + i + "," + j + "</td>"
                }
            }
        },
        toggleEditMode: function(event) {
            var $btn = $(event.target)
                , key = this.editMode ? "no" : "yes"

            $btn.text(this.buttonBehaviour[key].text).attr("title", this.buttonBehaviour[key].title)
            this.$("tbody").replaceWith(this.templateBody(this.bodyEditMode[key]))
            this.editMode = !this.editMode
        },
        templateHead: function () {
            var head = "<thead><tr>"
                head += "<th><button type='button' class='btn' id='toggleEditMode' title='" + this.buttonBehaviour.no.title + "'>" + this.buttonBehaviour.no.text + "</button></th>";
            for (var i = 0, len = this._timeSettings.days.length; i < len; i++) {
                head += "<th>" + this._timeSettings.days[i] + "</th>"
            }
            head += "</tr></thead>"
            return head
        },
        templateBody: function (fn) {
            var body = "<tbody>"
            for (var i = 0, len = this._timeSettings.hoursADay; i < len; i++) {
                body += "<tr>" +
                    "<th>" + (i + 1) + ". Stunde</th>"
                for (var j = 0, jlen = this._timeSettings.days.length; j < jlen; j++) {
                    body += fn.call(this, i, j)
                }
                body += "</tr>"
            }
            body += "</tbody>"
            return body
        },
        render: function () {
            this.$el.html(this.templateHead())
                .append(this.templateBody(this.bodyEditMode.no))
            return this;
        }
    })

})()
