(function () {

    var msg = {
        "markSaveFail": "Markierung konnte nicht gespeichert werden!",
        "markUpdateFail": "Markierung konnte nicht aktualisiert werden!",
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

    Abi.Model.Mark = Backbone.Model.extend({
        urlRoot: "Images/Marks/",
        idAttribute: "markid",
        defaults: {
            x: 0,
            y: 0
        }
    })

    Abi.Model.Image = Backbone.Model.extend({
        urlRoot: "Images/",
        imgUrl: function () {
            return ROOT + "__images/" + this.get("name");
        },
        thumbUrl: function () {
            return ROOT + "__images/thumbs/" + this.get("name");
        },
        idAttribute: "imageid"
    })

    Abi.Collection.Marks = Backbone.Collection.extend({
        model: Abi.Model.Mark,
        forImage: function (id) {
            return this.filter(function (model) {
                return model.get("imageid") == id
            })
        },
        reset: function (obj, op) {
            return Backbone.Collection.prototype.reset.call(this, obj.marks, op)
        }
    }, {
        instance: Backbone.Singleton()
    })

    Abi.Collection.Images = Backbone.Collection.extend({
        model: Abi.Model.Image,
        reset: function (obj, op) {
            return Backbone.Collection.prototype.reset.call(this, obj.images, op)
        }
    }, {
        instance: Backbone.Singleton()
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

    Abi.View.Imagination = Backbone.View.extend({
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
            this.listenTo(this.handler, "uploaded", this.uploaded)
                .listenTo(this.handler, "failed", this.failed)
                .listenTo(this.handler, "progress", this.progress)
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
                var percent = 100 * progress.loaded / progress.total;
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
            this.$el.html(this.templateForm()).append(this.templateImages()).append(this.templateExplanation())
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
        },
        // Returns the explanation for this tool
        templateExplanation: function () {
            return "<div>Hier kannst du das Profilbild, das du zusammen mit einem oder zwei Mitschülern aufgenommen hast, hochladen.<br />" +
                "Bitte sprich dich mit den anderen ab, wer hochlädt, das spart mir Speicherkapazität.<br />" +
                "Bitte nimm dafür das Bild in Originalauflösung, damit wir möglichst viel damit anfangen können.<br />" +
                "Das Format der Bilder ist JPEG, stelle hier die Qualität des Bildes ebenfalls auf maximal.<br />" +
                "Nachdem du das Bild hochgeladen hast, kannst du jeweils markieren, wessen Profile mit dem Bild verknüpft werden sollen.<br />" +
                "Dazu klickst du einfach auf die Miniaturansicht über diesem Text und kannst jeweils die Markierungen erstellen.<br />" +
                "Diese Markierungen haben zwei Gründe: Zum einen dürfen sich auf den Bildern theoretisch noch weitere Personen befinden, die aber ein anderes Profilbild haben werden.<br />" +
                "Zum anderen ist unsere Schule derart groß, dass wir nicht unbedingt mehr alle Mitschüler kennen, auch wenn das normalerweise natürlich schon der Fall ist.</div>"
        }
    })

    Abi.View.ImaginationImage = Backbone.View.extend({
        _subview: ["autoUser", "markList"],
        events: {
            "submit .saveMarkForm": "saveMark",
            "click .imaginationSetMark": "togglePositioning",
            "click #imaginationImage": "storePositioning",
            "click .imaginationDeleteImage": "destroyImage"
        },
        saveMark: function (event) {
            this.lock()
            event.preventDefault()
            this.listenTo(this.mark, "sync", this.sync)
                .listenTo(this.mark, "error", this.error)
            var toid = this.autoUser.value()
            if (toid <= 0) {
                this.error(this.mark, "markNameMissing")
                return
            }
            this.mark.set({
                toid: toid,
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
        error: function (model, error) {
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
            // First hide mark
            this.hideMark(this.mark, true)
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
            var $mark = this.$("#mark")
                , css = {
                    top: (mark.get("y") - $mark.outerHeight() / 2) + "px",
                    left: (mark.get("x") - $mark.outerWidth() / 2) + "px"
                }
            $mark.removeClass("hidden").css(css)
        },
        hideMark: function (mark, nokeep) {
            nokeep && (this._keep = false)
            !this._keep && this.$("#mark").addClass("hidden")
        },
        forceMark: function (mark) {
            this.showMark(mark)
            this._keep = true
        },
        destroyedMark: function (mark) {
            if (mark === this.mark) {
                this.setMark()
            }
            this.hideMark(mark, true)
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
            this.listenTo(this.markList, "showMark", this.showMark)
                .listenTo(this.markList, "hideMark", this.hideMark)
                .listenTo(this.markList, "forceMark", this.forceMark)
                .listenTo(this.markList, "editMark", this.setMark)
                .listenTo(this.markList, "destroyedMark", this.destroyedMark)
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
        destroyImage: function () {
            if (confirm("Möchtest du dieses Bild wirklich löschen?")) {
                this.listenTo(this.model, "destroy", this.destroySync)
                this.model.destroy()
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

    Abi.View.ImaginationMarkList = Backbone.View.extend({
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
            this.trigger("showMark", this.collection.get($(event.currentTarget).attr("href")))
        },
        leave: function (event) {
            this.trigger("hideMark", this.collection.get($(event.currentTarget).attr("href")))
        },
        click: function (event) {
            event.preventDefault()
            this.trigger("forceMark", this.collection.get($(event.currentTarget).attr("href")))
        },
        edit: function (event) {
            this.trigger("editMark", this._findMark(event))
        },
        trash: function (event) {
            var mark = this._findMark(event)
            this.listenTo(mark, "destroy", this.destroy)
            mark.destroy()
        },
        destroy: function(model) {
            model.off()
            this.$("#" + model.cid).remove()
            this.trigger("destroyedMark", model)
        },
        _findMark: function (event) {
            return this.collection.get($(event.currentTarget).closest("li").attr("id"))
        },
        initialize: function () {
            this.listenTo(this.collection, "reset", this.reset)
            this.listenTo(this.model, "reset", this.reset)
        },
        reset: function () {
            this.render()
        },
        render: function () {
            this.$el.html(this.templateMarks())
            return this
        },
        mayAdd: function (model) {
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
            return Backbone.View.prototype.remove.apply(this, arguments)
        }
    })

    var ROUTE = "imagination"
    App.router.route(ROUTE + "(/:image)", ROUTE, function (image) {
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