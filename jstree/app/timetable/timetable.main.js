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
            this.on("add", this._changeTimes, this)
        },
        _changeTimes: function (model) {
            var times = model.get("stunden")
            for (var i = 0, len = times.length, time; i < len; i++) {
                time = times[i]
                if (_.isArray(this.times[time])) {
                    this.times[time].push(model)
                }
            }
        },
        // Selects only lessons for the specific time
        // Lazy evaluated
        forTime: function (time) {
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
        instance: Abi.Singleton()
    })

    /**
     * @class HaveChanged
     * A list which stores all events which have changed
     */
    var HaveChanged = function (max) {
        this._max = max;
        this.reset()

    }
    _.extend(HaveChanged.prototype, {
        reset: function () {
            this._arr = new Array(this._max)
        },
        set: function(at, what) {
            this._arr[at] = what
        },
        get: function () {
            var results = []
            for (var i = 0; i < this._max; i++) {
                if (typeof this._arr[i] !== "undefined") {
                    results.push(i)
                }
            }
            return results;
        }
    })

    /**
     * @class Abi.Collection.StaticTimetable
     */
    Abi.Collection.StaticTimetable = function () {
        // Set default values
        this._store = new Array(60)
        for (var i = 0, len = this._store.length; i < len; i++) {
            this._store[i] = -1
        }
        this._available = Abi.Collection.Lessons.instance()
        this._haveChanged = new HaveChanged(60)
    }
    Abi.Collection.StaticTimetable.instance = Abi.Singleton()

    _.extend(Abi.Collection.StaticTimetable.prototype, Backbone.Events, {
        get: function (day) {
            return this._store[day] !== -1 ? this._available.get(this._store[day]) : null;
        },
        set: function (day, id) {
            this._haveChanged.reset()
            // Remove collisions
            if (id === -1) {
                this._remove(day)
            } else {
                this._removeCollisions(id)
                // Set new lesson
                this._set(id)
            }
            this.trigger("change", this)
            return this
        },
        changed: function () {
            return this._haveChanged.get()
        },
        _remove: function (day) {
            var model = this.get(day)
            // If no model is set for that day, just return
            if (!model) return this
            // Get every hour the model has
            var arr =  model.get("stunden")
            // Set every our in our store to -1
            for (var i = 0, len = arr.length; i < len; i++) {
                this._store[arr[i]] =  -1
                this._haveChanged.set(arr[i], -1)
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
            var arr = this._available.get(id).get("stunden")
            for (var i = 0, len = arr.length; i < len; i++) {
                this._store[arr[i]] =  id
                this._haveChanged.set(arr[i], id)
            }
            return this
        },
        toJSON: function () {
            return _.clone(this._store)
        },
        url: function () {
            return ROOT + "Timetable/me/"
        },
        fetch: function (op) {
            var options = op ? _.clone(op) : {}
                , success = options.success
                , model = this
                , save = false
            options.success = function (resp, status, xhr) {
                // Inject transformations
                if (window.TRANSFORMS) {
                    for (var i = 0, len = resp.length, curr; i < len; i++) {
                        curr = resp[i]
                        if (typeof window.TRANSFORMS[curr] !== "undefined") {
                            resp[i] = window.TRANSFORMS[curr]
                            // Only change if there is actually anything to transform
                            save = true
                        }
                    }
                }

                model._haveChanged.reset()
                model._store = resp
                for (var i = 0, len = resp.length; i < len; i++) {
                    model._haveChanged.set(i, resp[i])
                }
                if (success) {
                    success(resp, status, xhr)
                }
                model.trigger("change", model)
                if (save) {
                    model.save()
                }
            }
            return Backbone.sync.call(this, "read", this, options)
        },
        save: function (op) {
            var options = op ? _.clone(op) : {}
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
                    "<legend class='pointer attention' id='createNewLessonLegend'>Neuen Kurs anlegen</legend>" +
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
            "click #toggleEditMode": "toggleEditMode",
            "change select": "changeLesson"
        },
        initialize: function () {
            this._timeSettings = this.options._timeSettings
            this.staticFields = Abi.Collection.StaticTimetable.instance({
                change: this.change,
                sync: this.sync,
                error: this.error
            }, this)
            this.editMode = false;
            this.buttonBehaviour = {
                no: {
                    text: "Bearbeiten",
                    title: "Bearbeite deinen Stundenplan"
                },
                yes: {
                    text: "Speichern",
                    title: "Speichere deine eben getroffenen Änderungen"
                }
            }
            // The data cell body template renderer
            this.bodyEditMode = {
                no: function (computed) {
                    var item = this.staticFields.get(computed),
                        content = item == null ? "<i>frei</e>" : item.escape("fach") + " bei " + item.escape("lehrer")
                    return "<td id='" + this._makeId(computed) + "'>" + content + "</td>";
                },
                yes: function (computed) {
                    return "<td id='" + this._makeId(computed) + "'>" + this.templateSelectField(computed) + "</td>"
                }
            }

            // Adding new lessons
            this.collection.on("add", this.add, this).on("reset", this.render, this)
        },
        add: function (model) {
            console.log(model)
            // If in edit mode, we do not need to change anything when a new lesson is created since it doesnt appear anywhere
            if (!this.editMode) return
            var stunden = model.get("stunden");
            for (var i = 0, len = stunden.length, curr; i < len; i++) {
                curr = stunden[i]
                this._byId(curr).html(this.templateSelectField(curr))
            }
        },
        _makeId: function (id) {
            return this.cid + "-" + id;
        },
        _byId: function(id) {
            return this.$("#" + this._makeId(id))
        },
        hasEdit: function () {
            return this.editMode ? "yes" : "no"
        },
        toggleEditMode: function(event) {
            if (this.editMode) this.staticFields.save()
            this.editMode = !this.editMode
            var $btn = $(event.target)
                , key = this.hasEdit()

            $btn.text(this.buttonBehaviour[key].text).attr("title", this.buttonBehaviour[key].title)
            this.$("tbody").replaceWith(this.templateBody(this.bodyEditMode[key]))
        },
        changeLesson: function (event) {
            var $target = $(event.target)
                , toChange = parseInt($target.attr("data-id"), 10)
                , newValue = parseInt($target.val())
            this.staticFields.set(toChange, newValue)
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
                    body += fn.call(this, i + j * this._timeSettings.hoursADay)
                }
                body += "</tr>"
            }
            body += "</tbody>"
            return body
        },
        templateSelectField: function (id) {
            var select = "<select data-id='" + id + "'>" +
                "<option value='-1'>Wähle einen Kurs...</option>"
            for (var i = 0, elements = this.collection.forTime(id), len = elements.length, curr; i < len; i++) {
                curr = elements[i]
                select += "<option value='" + curr.id + "'" + (this.staticFields.get(id) === curr ? " selected" : "") + ">" + curr.escape("kuerzel") + ", " + curr.escape("lehrer") + "</option>"
            }
            select += "</select>"
            return select
        },
        change: function (model) {
            var changed = model.changed()
                , key = this.hasEdit()
            for (var i = 0, len = changed.length, curr; i < len; i++) {
                curr = changed[i]
                this._byId(curr).replaceWith(this.bodyEditMode[key].call(this, curr))
            }
        },
        render: function () {
            this.$el.html(this.templateHead())
                .append(this.templateBody(this.bodyEditMode.no))
            return this;
        },
        sync: function () {
            App.releaseBackgroundProcess()
        },
        error: function () {
            alert("Achtung, das Speichern des Stundenplanes hat wider Erwarten nicht geklappt! Versuche es bitte erneut!")
            this.toggleEditMode()
            App.releaseBackgroundProcess()
        },
        // Overwrite remove to remove zombie behaviour
        remove: function () {
            this.staticFields.off(null, null, this)
            return Abi.View.Base.prototype.remove.call(this)
        }
    })

})()
