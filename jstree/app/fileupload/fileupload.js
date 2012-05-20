/**
 * This is used for everything around the fileupload
 * This can get a bit more complicated, so we will do our best
 * */

(function () {  
    /**
     * @class Abi.EventModule
     * Only implements the eventhandling from backbone
     * */
    Abi.EventModule = function () {};
    _.extend(Abi.EventModule.prototype, Backbone.Events);    
    /**
     * The progress-xhr-object
     * returns a handle for listening to the progress event and a function for generating the xhr
     * */
    function getXHRWithProgress() 
    {
        // Create XMLHttpRequest   
        var xhr = new XMLHttpRequest(), events = new Abi.EventModule();
        // Add progress handler
        xhr.upload.addEventListener("progress", function (event) {
            events.trigger("progress", event);   
        });
        // Add finish handler
        xhr.upload.addEventListener("load", function(event) {
            events.trigger("upload", event);    
        });        
        return {
            xhr: function () {
                return xhr;    
            },
            events: events
        };        
    }
    
    /**
     * @function Abi.fileSync
     * Used for syncing file objects with the server
     * Delegates back to Backbone.sync if the method is either GET or DELETE
     * Should only be used with the Abi.Model.File class or its subclasses
     * */    
    Abi.fileSync = function (method, model, options) {
        // Delegate back
        if (method == "delete" || method == "get" || !(model instanceof Abi.Model.File)) {
            return Backbone.sync.apply(null, arguments);   
        }
        // We always need the options hash
        options || (options = {});
        // Get xhr
        var handle = getXHRWithProgress(),
        // We always have to use POST here
        params = {type: "POST", dataType: "json", xhr: handle.xhr, processData: false, contentType: false},
        // The FormData object
        formData = new FormData();
        if (!options.url) {
            params.url = App.getValue(model, "url") || App.urlError();    
        }
        // Map over progess events
        if (options.progress) {
            if (_.isArray(options.progress)) {
                for (var i = 0, len = options.progress.length; i < len; i++) {
                    handle.events.on("progress", options.progress[i]);
                }
            } else {
                handle.events.on("progress", options.progress);     
            }    
        }
        // Map over upload events
        if (options.upload) {
            if (_.isArray(options.progress)) {
                for (var i = 0, len = options.upload.length; i < len; i++) {
                    handle.events.on("upload", options.upload[i]);
                }
            } else {
                handle.events.on("upload", options.upload);
            }            
        }
        // Append data to the formData object
        formData.append("file", model.file());
        formData.append("model", JSON.stringify(model));
        formData.append("method", method);
        // Map over data object
        params.data = formData;        
        
        var ret = $.ajax(_.extend(params, options));
        // Allow for upload
        ret.upload = handle.events;
        return ret;          
    };
    
        /**
     * @class Model.File
     * Used for saving a single file
     * */
    Abi.Model.File = Abi.Model.Base.extend({
        // This contains the file object
        initialize: function (attr) {
            if(attr.file) {
                this.file(attr.file);
            }
        },
        file: function (file) {
            if (arguments.length == 0) {
                return this._file;
            } else {
                this._file = file;
                this.unset("file");
                return this;
            }
        },
        sync: Abi.fileSync,
        // Standard urlRoot
        urlRoot: "Files/",
        idAttribute: "name"
    });
    /**
     * @class Collection.Files
     * */
    Abi.Collection.Files = Abi.Collection.Base.extend({
        model: File,
        urlRoot: "Files/"
    });
    
    /**
     * @class View.Uploader
     * Includes a compatibility check for the FormData object
     * */
     if (FormData && typeof FormData === 'function') {
         Abi.View.Uploader = Abi.View.Base.extend({
            tagName: "input",
            initialize: function (opts) {
                this.$el.attr("type", "file");
                opts || (opts = {});
                if (opts.multiple) {
                    this.$el.attr("multiple", "multiple");
                }
            },
            // Returns a list of file objects
            files: function () {
                for (var i = 0, len = this.el.files.length, files = this.el.files, ret = []; i < len; i++) {
                    ret.push(new Abi.Model.File({
                        file: files[i]
                    }));
                }
                return ret;        
            },
            events: {
                "change": function () {
                    this.trigger("change");
                }
            }    
         });
     } else {
         Abi.View.Uploader = Abi.View.Base.extend({
            tagName: "input",
            initialize: function () {
                this.$el.attr("readonly", "readonly").val( App.message("browserFail") ).attr("title", App.message("moreInfoOnClick") ).attr("size", App.message("browserFail").length );
            },
            events: {
                click: function () {
                    alert(App.message("browserUpgradeFileUpload"));
                }    
            }       
         });
     }
           
}).call(this);