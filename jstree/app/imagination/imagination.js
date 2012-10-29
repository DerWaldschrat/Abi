(function () {
    
    var msg = {
        "markSaveFail": "Markierung konnte nicht gespeichert werden!",
        "markSaveSucceed": "Markierung erfolgreich gespeichert!",
        "markUpdateSucceed": "Markierung erfolgreich aktualisiert!",
        "markNameMissing": "Bitte gib an, wen du überhaupt markiert hast!",
        "markCoordMissing": "Bitte positioniere die Markierung!",
        "imageUploadSucceed": "Bilder erfolgreich hochgeladen!"
    }
    
    _.extend(App.Messages, msg)

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
                url: ROOT + this.urlRoot,
                processData: false,
                contentType: false,
                cache: false,
                data: this.formData,
                type: "post",
                success: _.bind(this.success, this),
                error: _.bind(this.error, this),
                xhr: function () {
                    var xhr = new XMLHttpRequest()
                    if (xhr.upload) {
                        xhr.upload.onprogress = function (evt) {
                            self.trigger("progress", evt)
                        }
                    }
                    return xhr
                }
            })
        },
        urlRoot: "Images/",
        error: function(error) {
            this.trigger("failed", error)
        },
        success: function (data) {
            this.trigger("uploaded", data)
        }
    })
    
    Abi.Model.Mark = Abi.Model.Base.extend({
        urlRoot: "Images/Marks/",
        idAttribute: "markid",
        validate: function () {
            if (!this.has("toid") || this.get("toid") === -1) return "markNameMissing"
        },
        defaults: {
            x: 0,
            y: 0
        }
    })
    
    Abi.Model.Image = Abi.Model.Base.extend({
        urlRoot: "Images/",
        imgUrl: function () {
            return ROOT + "__images/" + this.get("name");
        },
        thumbUrl: function () {
            return ROOT + "__images/thumbs/" + this.get("name");
        },
        idAttribute: "imageid"
    })
    
    Abi.Collection.Marks = Abi.Collection.Base.extend({
        model: Abi.Model.Mark,
        forImage: function (id) {
            return this.filter(function (model) {
                return model.get("imageid") == id
            })
        },
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
            "submit #uploadForm": "uploadForm",
            "click .imagination a": "goToSingle"
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
            this.showProgress()
        },
        goToSingle: function (event) {
            event.preventDefault()
            App.router.navigate($(event.currentTarget).attr("href"), {
                trigger: true
            })
        },
        uploaded: function (data) {
            this.images.add(data)
            this.message("imageUploadSucceed", true)
            this.hideProgress()
        },
        failed: function (error) {
            this.message(error)
            this.hideProgress()
        },
        progress: function (progress) {
            if (progress.lengthComputable) {
                var percent = progress.loaded / progress.total;
                $(".buttonAndMessage .bar").css({
                    width: percent + "%"
                })
            }
        },
        showProgress: function () {
            this.$(".buttonAndMessage").prepend("<div class='progress span3'><div class='bar'></div></div>")
        },
        hideProgress: function () {
            this.$(".buttonAndMessage .progress").remove()
        },
        setProgress: function () {
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
                    + "<fieldset class='control-group buttonAndMessage'>"
                        + "<div class='statusField help-block'></div>"
                    + "</fieldset>"
                + "</form>"
            return html
        },
        templateImages: function () {
            var html = "<ul class='thumbnails imagination'>"
            for (var i = 0, len = this.images.length, curr; i < len; i++) {
                curr = this.images.models[i]
                html += this.templateImage(curr)
            }
            html += "</ul>"
            return html
        },
        templateImage: function (curr) {
            return "<li><a href='imagination/" + curr.id + "' class='thumbnail'><img src='" + curr.thumbUrl() + "' /></a></li>"
        }
    })
    
    Abi.View.ImaginationImage = Abi.View.Base.extend({
        events: {
            "submit .saveMarkForm": "saveMark",
            "click .imaginationSetMark": "togglePositioning",
            "click #imaginationImage": "storePositioning",
            "click .imaginationDeleteImage": "destroyImage"
        },
        saveMark: function (event) {
            this.lock()
            event.preventDefault()
            this.mark.on("sync", this.sync, this).on("error", this.error, this)
            this.mark.set({
                toid: this.autoUser.value(),
                imageid: this.model.id
            }, {
                silent: true
            })
            this._creating = this.mark.isNew()
            this.mark.save()
        },
        sync: function () {
            
            this.unlock()
            this.message(this._creating ? "markSaveSucceed" : "markUpdateSucceed", true)
            this._creating ? this.markList.mayAdd(this.mark) : this.markList.update(this.mark)
            this.setMark()
        },
        error: function (model,error) {
            if (error.responseText) {
            } else {
            }
            this.message(error)
            this.unlock()
        },
        lock: function () {
            this.$("form input, form button").prop("disabled", true)
        },
        unlock: function () {
            this.$("form input, form button").prop("disabled", false)
            this.$(".imaginationControlTitle").text(this.getControlTitle())
        },
        togglePositioning: function (event) {
            var $target = $(event.currentTarget)
            // User has finished positioning
            if (this._positionMode) {
                $target.text("Markierung positionieren")
                this.hideMark(this.mark)
            // User has started positioning
            } else {
                $target.text("Fertig positioniert")
                this.showMark(this.mark)
            }
            this.$el.toggleClass("editMode")
            this._positionMode = !this._positionMode
            this.$(".submitMarkForm").prop("disabled", this._positionMode)
        },
        storePositioning: function(event) {
            if (this._positionMode) {
                var $target = $(event.currentTarget)
                , offset = $target.offset()
                this.mark.set({
                    x: event.pageX - offset.left,
                    y: event.pageY - offset.top
                }, {
                    silent: true
                })
                this.showMark(this.mark)
            }
        },
        initialize: function () {
            this.setSubviewStore("autoUser", "markList")
            this.autoUser = null
            this.collection = Abi.Collection.Images.instance({
                reset: this.reset
            }, this)
            this.start()
            this.setMark()
            this._positionMode = false
        },
        start: function () {
            this.model = this.collection.get(this.options.image)
        },
        setMark: function (mark) {
            this.mark = mark || new Abi.Model.Mark()
            this.autoUser && this.autoUser.value(this.mark.get("toid"))
            this.$(".imaginationControlTitle").text(this.getControlTitle())
        },
        reset: function () {
            this.start()
            this.render()
        },
        showMark: function (mark) {
            if (this._force === mark) return;
            this._force = null;
            var $mark = this.$("#mark")
            , css = {
                top: (mark.get("y") - $mark.outerHeight() / 2) + "px",
                left: (mark.get("x") - $mark.outerWidth() / 2) + "px"
            }
            $mark.removeClass("hidden").css(css)
        },
        hideMark: function (mark) {
            !this._force && this.$("#mark").addClass("hidden")
        },
        forceMark: function (mark) {
            this.showMark(mark)
            this._force = mark
        },
        destroyedMark: function (mark) {
            if (mark === this._force) {
                this._force = null
                this.hideMark(mark)
            }
            if (mark === this.mark) {
                this.setMark()
            }
        },
        render: function () {
            this.autoUser !== null && this.autoUser.remove()
            if (this.model == null) {
                this.$el.html("<h1>Dieses Bild wurde leider nicht gefunden!</h1>")
            } else {
                this._createMarkList()
                this.$el.html(this.templateControl() + this.templateBeforeMarks())
                .append(this.markList.render().el)
                .append(this.templateImage())
                .append(this.templateDeleteImage())
                this.autoUser = new Abi.View.AutocompleteUser({
                    collection: userList,
                    el: this.$("#markedUser")[0]
                })
            }
            return this
        },
        _createMarkList: function () {
            this.markList = new Abi.View.ImaginationMarkList({
                model: this.model,
                collection: Abi.Collection.Marks.instance()
            })
            this.markList.on("showMark", this.showMark, this)
            this.markList.on("hideMark", this.hideMark, this)
            this.markList.on("forceMark", this.forceMark, this)
            this.markList.on("editMark", this.setMark, this)
            this.markList.on("destroyedMark", this.destroyedMark, this)
            this._force = null
        },
        templateImage: function () {
            if (!this.model) return ""
            var html = "<div class='imaginationContainer'><img src='" + this.model.imgUrl() + "' id='imaginationImage' /><div id='mark' class='hidden'></div></div>"
            return html
        },
        templateControl: function () {
            var html = ""
            html += "<form action='#' class='saveMarkForm'>"
                    + "<fieldset class='control-group'>"
                        + "<legend>Markierung <span class='imaginationControlTitle'>" + this.getControlTitle() + "</span></legend>"
                        + "<label for='markedUser'>Markierte Person:</label>"
                        + "<input type='text' id='markedUser' /><br />"
                        + "<button type='button' class='btn imaginationSetMark' title='Hiermit startest du den Markierungsmodus: einfach die Person unten auf dem Bild anklicken'>Markierung positionieren</button>"
                    + "</fieldset>"
                    + "<fieldset class='control-group buttonAndMessage'>"
                        + "<button type='submit' class='btn submitMarkForm'>Markierung speichern</button>"
                        + "<div class='statusField help-block'></div>"
                    + "</fieldset>"
                + "</form>"
            return html
        },
        templateBeforeMarks: function () {
            return "Bisher auf dem Bild markiert:"
        },
        templateDeleteImage: function () {
            return "<button class='btn btn-danger imaginationDeleteImage'>Bild komplett löschen</button>"
        },
        getControlTitle: function () {
            var user = userList.get(this.mark.get("toid"))
            return this.mark.isNew() ? "erstellen" : "von " + user.escape("vorname") + " " + user.escape("nachname")  +" bearbeiten"
        },
        remove: function () {
            this.markList && this.markList.off(null, null, this)
            this.mark && this.mark.off(null, null, this)
            return Abi.View.Base.prototype.remove.apply(this, arguments)
        },
        destroyImage: function () {
            if (confirm("Möchtest du dieses Bild wirklich löschen?")) {
                this.model.on("destroy", this.destroySync, this).destroy({
                    wait: true
                })
            }
        },
        destroySync: function () {
            // We need this because of the Image collection
            window.setTimeout(function () {
                App.router.navigate("imagination", {
                    trigger: true,
                    replace: true
                })
            }, 10)
        }
    })
    
    Abi.View.ImaginationMarkList = Abi.View.Base.extend({
        tagName: "ul",
        className: "inline",
        events: {
            "mouseenter a.name": "enter",
            "mouseleave a.name": "leave",
            "click a.name": "click",
            "click .edit": "edit",
            "click .trash": "trash"
        },
        enter: function (event) {
            this.trigger("showMark", this.collection.getByCid($(event.currentTarget).attr("href")))
        },
        leave: function (event) {
            this.trigger("hideMark", this.collection.getByCid($(event.currentTarget).attr("href")))
        },
        click: function (event) {
            event.preventDefault()
            this.trigger("forceMark", this.collection.getByCid($(event.currentTarget).attr("href")))
        },
        edit: function (event) {
            this.trigger("editMark", this._findMark(event))
        },
        trash: function (event) {
            var mark = this._findMark(event)
            mark.on("destroy", this.destroy, this).destroy({
                wait: true
            })
        },
        destroy: function(model) {
            model.off()
            this.$("#" + model.cid).remove()
            this.trigger("destroyedMark", model)
        },
        _findMark: function (event) {
            return this.collection.getByCid($(event.currentTarget).closest("li").attr("id"))
        },
        initialize: function () {
            this.collection.on("reset", this.reset, this)
            this.model.on("reset", this.reset, this)
        },
        reset: function () {
            this.render()
        },
        render: function () {
            this.$el.html(this.templateMarks())
            return this
        },
        mayAdd: function (model) {
            console.log(model)
            if (model.get("imageid") == this.model.id) {
                this.collection.add(model)
                this.$el.append(this.templateMark(model))
            }
        },
        update: function (model) {
            this.$("#" + model.cid).replaceWith(this.templateMark(model))
        },
        templateMarks: function () {
            var html = ""
            , marks = this.collection.forImage(this.model && this.model.id) || []
            for (var i = 0, len = marks.length; i < len; i++) {
                html += this.templateMark(marks[i])
            }
            return html
        },
        templateMark: function (mark) {
            var user = userList.get(mark.get("toid"))
            if(!user) return ""
            var html = "<li id='" + mark.cid + "'><a href='" + mark.cid + "' class='name'>" + user.escape("vorname") + " " + user.escape("nachname") + "</a> - <i class='icon-edit edit pointer' title='Markierung bearbeiten'></i> - <i class='icon-trash trash pointer' title='Markierung löschen'></i></li>"
            return html
        },
        remove: function () {
            return Abi.View.Base.prototype.remove.apply(this, arguments)
        }
    })

    var ROUTE = "imagination"
    App.addNavigationItem(ROUTE, "Deine Profilbilder")
    ROUTE += "(/:image)"
    App.router.route(ROUTE, ROUTE, function (image) {
        if (typeof FormData !== 'function') {
            alert("Achtung, dein Browser unterstützt keine Uploads! Bitte benutze einen moderneren Browser, etwa Mozilla Firefox ab Version 4!")
        }
        if (!image) {
            App.setView(new Abi.View.Imagination())
        } else {
            App.setView(new Abi.View.ImaginationImage({
                image: image
            }))
        }
        
    })
})();