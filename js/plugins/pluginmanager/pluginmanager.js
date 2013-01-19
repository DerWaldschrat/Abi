/**
 * PLUGIN: {
     version: "0.1",
     name: "Pluginmanager"
 }
 * This Plugin is used to install and/or remove other plugins
 * */
(function () {

    /**
     * @class Abi.Model.Plugin
     * */
    Abi.Model.Plugin = Abi.Model.Base.extend({
        urlRoot: "plugins/Plugins/"      
    });
    
    /**
     * @class Abi.View.Pluginmanager
     * The main view for the Pluginmanager
     * */
    Abi.View.Pluginmanager = Abi.View.Base.extend({
        template: function () {
            
        }   
    });
    
    /**
     * @class Abi.View.Plugin
     * */
    Abi.View.Plugin = Abi.View.Base.extend({
        template: function () {
            
        }    
    }); 
    
    // First add navigation item
    App.addNavigationItem("pluginmanager", "Pluginmanager");
    App.router.route("pluginmanager", "pluginmanager", function () {
        // As simple as it can be: Just create view, render it and append to dom
        var pluginmanager = new Abi.View.Pluginmanager();
        App.reset().append(pluginmanager.render().el);   
    }); 
})();