// The list of all Users
App.user.rights() >= 1 ? (function () {
    var ROUTE = "alluser"
    
    App.addNavigationItem(ROUTE, "Alle User anzeigen")
    
    Abi.View.AllUserList = Abi.View.Base.extend({
        template: function () {
            var template = "<table><thead><tr>"
            // Table head
            , fields = ["Name", "Nickname"]
            , curr
            , _asHyperlink = function (val) {
                return "<a href='#profile/" + curr.id +  "'>" + val + "</a>"                
            }
            for (var i = 0, len = fields.length; i < len; i++) {
                template += "<th>" + fields[i] + "</th>"
            }            
            template += "</tr></thead><tbody>"
            // The actual data
            for (var i = 0, len = this.collection.length; i < len; i++) {
                curr = this.collection.at(i)
                template += "<tr id='alluser" + curr.id + "'>"
                + "<td>"
                + _asHyperlink(curr.get("vorname") + " " + curr.get("nachname"))
                + "</td>"
                + "<td>"
                + _asHyperlink(curr.get("nickname"))
                + "</td>"
                + "</tr>"
                   
            }
            template += "</tbody></table>"
            return template;        
        },
        render: function () {
            this.$el.html(this.template()).find("table").addClass("table table-bordered")
            return this;
        }
    })
    
    App.router.route(ROUTE, ROUTE, function () {
        var view = new Abi.View.AllUserList({
            collection: userList
        }).render()
        App.reset().append(view.el)
    })    
}).call(this) : 0;