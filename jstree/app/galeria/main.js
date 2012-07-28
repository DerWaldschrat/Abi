// First load fancybox
steal("jstree/fancybox", "jstree/fancybox/fancybox.css").then(function () {
    
    var Galeria = Abi.Galeria = {
        ROOT: ROOT + "__galeria/",
        thumbsDefault: "thumbs/"
    }
    
    /**
     * @class Model.GaleriaImage
     * A single instance of an image
     * */
    Abi.Model.GaleriaImage = Abi.Model.Base.extend({
        initialize: function () {
            this.prepare()        
        },
        prepare: function () {
            this.path = Abi.getValue(this.collection, "url") + this.id
            this.thumb = Abi.getValue(this.collection, "url") + (options.thumbs) || Galeria.thumbsDefault + this.id 
        },
        idAttribute: "name"
    })
    /**
     * @class Model.Galeria
     * Contains the Meta-Info for the Galeria
     * */
     var g = Abi.Model.Galeria = Abi.Model.Base.extend({
         initialize: function () {
            //this.container = new Abi.Collection.Galeria().fetch() 
         }
     })

    /**
     * @class Collection.GaleriaViewable
     * Receives a list of all galeries a user can view
     * */    
    Abi.Collection.GaleriaViewable = Abi.Collection.Base.extend({
        urlRoot: "Galeria/",
        model: g       
    }, {
        // Make the instance really private
        instance: Abi.Singleton()
    })

    /**
     * @class Collection.Galeria
     * This Collection holds all the Images of a galerie
     * It is model-like
     * */    
    Abi.Collection.Galeria = Abi.Collection.Base.extend({
        model: Abi.Model.GaleriaImage,
        initialize: function (options) {
            // Create id to have the model-like style
            this.id = options.id
        },
        url: function () {
            return Galeria.ROOT + this.id + "/"
        }            
    })

    /**
     * @class View.Galeria
     * The page which lists all galeries the user can view
     * */
    Abi.View.Galeria = Abi.View.Base.extend({
        initialize: function () {
            
            this.available = Abi.Collection.GaleriaViewable.instance({
                reset: this.reset                
            }, this)
        },
        reset: function () {
            console.log("Resetted!", this.available)
        }
    })
})