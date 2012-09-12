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
        is: function (id) {
            var arr = this.get("stunden")
            for (var i = 0, len = arr.length; i < len; i++) {
                if (arr[i] == id) return true;
            }
            return false;
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
            this.times = [];
        },
        // Selects only lessons for the specific time
        // Lazy evaluated
        forTime: function (time) {
            if (this.times[time] != null) {
                return this.times[time];
            }
            this.times[time] = []
            for (var i = 0, len = this.models.length; i < len; i++) {
                if (this.models[i].is(time)) {
                    this.times[time].push(this.models[i])
                }
            }
            return this.times[time];
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
        initialize: function () {

        }
    })

})()
