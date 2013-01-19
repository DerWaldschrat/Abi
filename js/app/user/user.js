// This file contains user models, collections and the profileview
(function () {

    /**
     * The main user model class
     * @class Abi.Model.User
     */
    Abi.Model.User = Backbone.Model.extend({
        // You must not call fetch or destroy on your own user model
        fetch: null,
        destroy: null,
        // The idAttribute needs to be changed here
        idAttribute: "userid",
        urlRoot: "User/",
        // Direct access to the rights property
        rights: function () {
            return this.get("rights")
        },
        fetchNamedLessons: function () {
            if (this.has("namedLessons")) {
                return
            }
            var self = this
            $.ajax({
                url: ROOT + "Timetable/me/?named=1",
                success: function (resp) {
                    self.set("namedLessons", resp)
                }
            })
        }
    })

})()