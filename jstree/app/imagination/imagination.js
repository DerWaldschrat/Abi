(function () {
    function normalizeFile(file) {
        if (!file.name) { 
            file.name = file.fileName
        }
        if (!file.size) {
            file.size = file.fileSize
        }
        return file
    }
    
    function normalizeFileList(files) {
        var arr = Array.prototype.slice.call(files, 0)
        return _.map(arr, normalizeFile)
    }
    
    // Responsible for handling the file upload
    function FileUploadHandler(files) {
        this.files = files
        this.formData = new FormData()
    }
    
    // Mixin events
    _.extend(FileUploadHandler.prototype, Backbone.Events, {
        upload: function () {
            this._fillFormData()
            return this._createXHR()
        },
        _fillFormData: function () {
            for (var i = 0, len = this.files.length; i < len; i++) {
                this.formData.append("image[]", this.files[i])
            }
        },
        _createXHR: function () {
            var self = this
            return $.ajax({
                url: ROOT + this.rootUrl,
                processData: false,
                contentType: false,
                cache: false,
                data: this.formData,
                type: "post",
                success: _.bind(this.success, this),
                error: _.bind(this.error, this)
                
            })
        },
        rootUrl: "Images/",
        error: function(error) {
            this.trigger("failed", error)
        },
        success: function (data) {
            this.trigger("uploaded", data)
        }
    })
    
    Abi.Model.Mark = Abi.Model.Base.extend({
        rootUrl: "Images/Marks/"
    })
    
    Abi.Model.Image = Abi.Model.Base.extend({
        rootUrl: "Images/",
        imgUrl: function () {
            return ROOT + "__images/" + this.get("name");
        },
        thumbUrl: function () {
            return ROOT + "__images/thumbs/" + this.get("name");
        }
    })
    
    Abi.Collection.Marks = Abi.Collection.Base.extend({
        model: Abi.Model.Mark,
        reset: function (obj, op) {
            return Abi.Collection.Base.prototype.reset.call(this, obj.marks, op)
        }
    }, {
        instance: Abi.Singleton()
    })
    
    Abi.Collection.Images = Abi.Collection.Base.extend({
        model: Abi.Model.Image,
        reset: function (obj, op) {
            return Abi.Collection.Base.prototype.reset.call(this, obj.images, op)
        }
    }, {
        instance: Abi.Singleton()
    })
    
    // Override fetch method, which has to split up the results
    var deferred = null
    Abi.Collection.Marks.prototype.fetch = Abi.Collection.Images.prototype.fetch = function () {
        var self = this
        if (deferred === null) {
            deferred = $.ajax(ROOT + "Images/")
        }
        deferred.done(function (data) {
            self.reset(data)
        })
    }

    Abi.View.Imagination = Abi.View.Base.extend({
        events: {
            "click .selectUploadImage": "selectUploadImage",
            "submit #uploadForm": "uploadForm"
        },
        selectUploadImage: function () {
            this.$("#uploadImage").trigger("click")
        },
        uploadForm: function (event) {
            event.preventDefault()
            var files = normalizeFileList(this.$("#uploadImage").prop("files"))
            this.count = files.length
            // Create new upload handler
            this.handler = new FileUploadHandler(files)
            this.handler.on("uploaded", this.uploaded, this).on("failed", this.failed, this).on("progress", this.progress, this)
            this.handler.upload()
            
        },
        uploaded: function (data) {
            this.images.add(data)
        },
        failed: function (error) {
            console.log(error)
        },
        progress: function (progress) {
            console.log(progress)
        },
        initialize: function () {
            // The file upload handler
            this.handler = null
            // The amount of files currently uploaded
            this.count = 0
            this.images = Abi.Collection.Images.instance({
                reset: this.resetImages,
                add: this.addImage
            }, this)
            this.marks = Abi.Collection.Marks.instance()
        },
        resetImages: function () {
            this.$(".thumbnails").replaceWith(this.templateImages())
        },
        addImage: function (model) {
            this.$(".thumbnails").append(this.templateImage(model))
        },
        render: function () {
            this.$el.html(this.templateForm()).append(this.templateImages())
            return this
        },
        templateForm: function () {
            var html = "<form id='uploadForm' action='#'>"
                    + "<fieldset class='control-group'>"
                        + "<legend>Neues Bild hochladen</legend>"
                        + "<label title='Du kannst auch mehrere Bilder auf einmal auswählen'>"
                            + "<button type='button' class='selectUploadImage btn'>Bild(er) auswählen</button>"
                        + "</label>"
                        + "<input type='file' multiple='multiple' id='uploadImage' class='hidden' accept='image/*' />"
                        + "<button type='submit' id='uploadImageSubmit' class='btn'>Hochladen</button>"
                    + "</fieldset>"
                + "</form>"
            return html
        },
        templateImages: function () {
            var html = "<ul class='thumbnails'>"
            for (var i = 0, len = this.images.length, curr; i < len; i++) {
                curr = this.images.models[i]
                html += this.templateImage(curr)
            }
            html += "</ul>"
            return html
        },
        templateImage: function (curr) {
            return "<li class='thumbnail span3'><img src='" + curr.thumbUrl() + "' /></li>"
        }
    })

    var ROUTE = "imagination"
    App.addNavigationItem(ROUTE, "Deine Profilbilder")
    App.router.route(ROUTE, ROUTE, function () {
        if (typeof FormData !== 'function') {
            alert("Achtung, dein Browser unterstützt keine Uploads! Bitte benutze einen moderneren Browser, etwa Mozilla Firefox ab Version 4!")
        }
        App.setView(new Abi.View.Imagination())
    })
})();