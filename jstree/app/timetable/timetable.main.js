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
     * @classs Abi.Collection.Lessons
     */
    Abi.Collection.Lessons = Abi.Collection.Base.extend({
        urlRoot: "Timetable/",
        model: Abi.Model.Lesson,
        initialize: function () {
            this.times = []
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
            "submit .createNewLesson": "createNewLesson"
        },
        initialize: function () {
            this.collection = Abi.Collection.Lessons.instance()
            this._timeSettings = {
                hoursADay: 12,
                days: ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag"]
            }
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
                    "<legend>Neuen Kurs anlegen</legend>" +
                    "<label for='lessonKuerzel'>Das Kürzel (etwa wr3 oder m1):</label>" +
                    "<input type='text' id='lessonKuerzel' />" +
                    "<label for='lessonLehrer'>Der unterrichtende Lehrer:</label>" +
                    "<input type='text' id='lessonLehrer' />" +
                    "<label for='lessonFach'>Das Fach des Kurses</label>" +
                    "<input type='text' id='lessonFach' />" +
                    "<div>Die Stunden:</div>" +
                    this._chooseOfHour() +
                "</fieldset>" +
                "<fieldset class='buttonAndMessage control-group'>" +
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
        render: function () {
            this.$el.html(this.templateCreate())
            return this
        }
    })

})()
