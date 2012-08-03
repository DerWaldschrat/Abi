// First load fancybox
steal("jstree/fancybox", "jstree/fancybox/fancybox.css").then(function () {

    var Galeria = Abi.Galeria = {
        ROOT: (function () {
            var flag = -1,
            root = ROOT + "__galeria/"
            return function () {
                /*flag++
                var ret = flag != 0 ? root : root.replace("http://", "http://" + App.user.get("nickhash") + ":" + App.user.get("cat") + "@")
                console.log(ret)
                return ret*/
                return root
            }         
        })(),
        thumbsDefault: "thumbs/",
        /**
         * Firefox has a strange behaviour towards server authentification
          So here is a workaround which maps every url to a flat directory structure
         * */
        ffHack: "_WwwW_",
        ffMakeUrl: function (str) {
            return str.substr(0, str.length - 1) + Galeria.ffHack
        }
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
            this.path = (App.getValue(this.collection, "urlBase")) + this.id
            this.thumb = (App.getValue(this.collection, "urlBase")) + ((options.thumbs) || Galeria.thumbsDefault) + this.id
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
        urlBase: function () {
            return Galeria.ROOT() + this.id + "/"
        },
        url: function () {
            return this.urlBase()     
        },
        fetch: function (opts) {
            opts || (opts = {})
            var options = {
                username: App.user.get("nickhash"),
                password: App.user.get("cat")
            }
            options = _.extend(options,opts)
            return Backbone.Collection.prototype.fetch.call(this, options)                
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
                reset: this.render
            }, this)
        },
        render: function () {
            this.$el.empty()
            this.gal = {}
            var i, len, curr, j
            for (
            i = 0, len = this.available.length; i < len; i++) {
                curr = this.available.at(i)
                this.gal[curr.cid] = new Abi.View.GaleriaInstance({
                    model: curr
                })
            }
            for (j in this.gal) {
                this.$el.append(this.gal[j].render().$el)
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
            "click .showGaleria": "loadGaleria",
            "click .pagination a": "showPage"
        },
        initialize: function () {
            this.collection = this.model.container
            // Lazy-loading
            this.loaded = false
            this.perPage = 42
            this.activePage = 1
        },
        render: function () {
            this.$el.empty().append(this.templateHead(this.model))
            if (this.loaded) {
                this.$el
                .append(this.templatePagination(this.collection))
                .append(this.templateBody(this.collection))
                .find(".galeria a").fancybox({
                    openEffect: "fade",
                    closeEffect: "fade",
                    prevEffect: "fade",
                    nextEffect: "fade"
                })
            } else {
                this.$el.append(this.templateStartBody(this.collection))
            }
            return this
        },
        templateHead: function (model) {
            return "<h1>" + model.get("name") + "</h1>"
        },
        templateBody: function (collection, page) {
            var html = "<ul class='thumbnails galeria' style='margin-left: 0; padding-left: 0;'>"
            for (var i = page || 0, len = Math.min(i + this.perPage, collection.length), orientation, size; i < len; i++) {
                curr = collection.at(i)
                orientation = curr.get("o") === 1 ? "portrait" : "landscape"
                html += "<li><a href='" + curr.path + "' rel='" + this.cid + "' class='thumbnail'><img src='" + curr.thumb + "' class='" + orientation + "' /></a></li>"
            }
            html += "</ul>"
            return html
        },
        templatePagination: function (collection) {
            if (collection.length <= this.perPage) return "";
            var perPage = this.perPage
            , html = "<div class='pagination'><ul>"

            for (var i = 0, len = collection.length, j = 1, cls; i < len; i += perPage, j++) {
                cls = j == this.activePage ? " class='active'" : "";
                html += "<li"+cls+"><a href='#'>" + j + "</a></li>";
            }
            html += "</ul></div>"
            return html
        },
        templateStartBody: function (collection) {
            return "<a href='#' class='showGaleria'>Galerie laden (" + collection.length + " Bilder)</a>"
        },
        loadGaleria: function (event) {
            event.preventDefault()
            this.loaded = true
            return this.render()
        },
        showPage: function (event) {
            event.preventDefault()
            var $target = $(event.target)
            , num = parseInt($target.text(), 10) || 1
            this.$(".pagination .active").removeClass("active")
            $target.parent().addClass("active")
            this.$(".galeria").replaceWith(this.templateBody(this.collection, (num - 1) * this.perPage))
        },
        goToPage: function (page) {
            this.$(".pagination li a").eq(page - 1).trigger("click")    
        }
    })  
})