(function () {
    // The chat plugin
    
    // Map over variables
    var Abi = this.Abi
    , App = this.App
    
    
    // The message Model
    Abi.Model.Message = Abi.Model.Base.extend({
        initialize: function () {
            var time = this.has("time") ? new Date(this.get("time")) : new Date()
            this.set({
                time: time
            })    
        },
        isToAll: function () {
            return !!this.get("toAll")
        }
    })
    
    // Set up path to socket.io flashsockets
    var WEB_SOCKET_SWF_LOCATION = window.WEB_SOCKET_SWF_LOCATION = ROOT + "jstree/socket.io/WebSocketMain.swf";
    
    
    
        
}).call(this)