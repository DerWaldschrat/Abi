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
        initialize: function (options) {
            options || (options = {})
            this.prepare(options)        
        },
        prepare: function (options) {
            this.path = App.getValue(this.collection, "url") + this.id
            this.thumb = App.getValue(this.collection, "url") + ((options.thumbs) || Galeria.thumbsDefault) + this.id 
        },
        idAttribute: "name"
    })
    /**
     * @class Model.Galeria
     * Contains the Meta-Info for the Galeria
     * */
     var g = Abi.Model.Galeria = Abi.Model.Base.extend({
         initialize: function () {
            this.container = new Abi.Collection.Galeria({
                id: this.id
            }).on("reset", this.reset, this)
            this.container.fetch()
         },
         reset: function () {
             this.trigger.apply(this, ["reset"].concat(arguments) )
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
        _subViewList: ["gal"],
        initialize: function () {
            
            this.available = Abi.Collection.GaleriaViewable.instance({
                reset: this.reset                
            }, this)
        },
        reset: function () {
            this.$el.empty()
            console.log("Resetted!", this.available)
            this.gal = {}
            var i, len, curr
            for (
            i = 0, len = this.available.length; i < len; i++) {
                curr = this.available.at(i)
                this.gal[curr.cid] = new Abi.View.GaleriaInstance({
                    model: curr
                })
            }
            console.log(len)
            return this.render()
        },
        render: function () {
            var i
            for (i in this.gal) {
                this.$el.append(this.gal[i].render().$el)
            }
            return this
        }
    })
    
    /**
     * @class View.GaleriaInstance
     * This displays one galerie
     * */
    Abi.View.GaleriaInstance = Abi.View.Base.extend({
        events: {
            "click .showGaleria": "loadGaleria"    
        },
        initialize: function () {
            this.collection = this.model.container
            // Lazy-loading
            this.loaded = false;
        },
        render: function () {
            this.$el.empty().append(this.templateHead(this.model))
            if (this.loaded) {
                this.$el.append(this.templateBody(this.collection))
                .find(".galeria a").fancybox({
                    openEffect: "fade",
                    closeEffect: "fade",
                    prevEffect: "fade",
                    nextEffect: "fade"
                })    
            } else {
                this.$el.append(this.templateStartBody())
            }
            return this    
        },
        templateHead: function (model) {
            return "<h1>" + model.get("name") + "</h1>"        
        },
        templateBody: function (collection) {
            var html = "<ul class='thumbnails galeria' style='margin-left: 0; padding-left: 0;'>"
            for (var i = 0, len = this.collection.length, orientation, size; i < len; i++) {
                curr = this.collection.at(i)
                orientation = curr.get("o") === 1 ? "portrait" : "landscape"
                html += "<li><a href='" + curr.path + "' rel='" + this.cid + "' class='thumbnail'><img src='" + curr.thumb + "' class='" + orientation + "' /></a></li>"                
            }
            html += "</ul>"
            return html
        },
        templateStartBody: function () {
            return "<a href='#' class='showGaleria'>Galerie laden</a>"
        },
        loadGaleria: function (event) {
            event.preventDefault()
            this.loaded = true
            return this.render()            
        }
    })
})