// Generated by CoffeeScript 1.3.1

/*!
Author: Radoslav Stankov
Project site: https://github.com/RStankov/backbone-bind-to
Licensed under the MIT License.
*/


(function() {
  var BackboneView, BindToView, root,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  root = this;

  BackboneView = root.Backbone.View;

  BindToView = (function(_super) {

    __extends(BindToView, _super);

    BindToView.name = 'BindToView';

    function BindToView() {
      var eventName, methodName, _ref, _ref1;
      BindToView.__super__.constructor.apply(this, arguments);
      if (this.model) {
        _ref = this.bindToModel;
        for (eventName in _ref) {
          methodName = _ref[eventName];
          this.bindTo(this.model, eventName, methodName);
        }
      }
      if (this.collection) {
        _ref1 = this.bindToCollection;
        for (eventName in _ref1) {
          methodName = _ref1[eventName];
          this.bindTo(this.collection, eventName, methodName);
        }
      }
    }

    BindToView.prototype.bindTo = function(object, eventName, methodName) {
      if (object !== this.model && object !== this.collection) {
        this._binded = [];
        if (!_.include(this._binded, object)) {
          this._binded.push(object);
        }
      }
      if (!this[methodName]) {
        throw new Error("Method " + methodName + " does not exists");
      }
      if (typeof this[methodName] !== 'function') {
        throw new Error("" + methodName + " is not a function");
      }
      return object.on(eventName, this[methodName], this);
    };

    BindToView.prototype.remove = function() {
      if (this.model) {
        this.model.off(null, null, this);
      }
      if (this.collection) {
        this.collection.off(null, null, this);
      }
      _.invoke(this._binded, 'off', null, null, this);
      delete this._binded;
      return BindToView.__super__.remove.apply(this, arguments);
    };

    return BindToView;

  })(BackboneView);

  Backbone.BindTo = {
    VERSION: '1.0.0',
    noConflict: function() {
      root.Backbone.View = BackboneView;
      return BindToView;
    },
    View: BindToView
  };

  root.Backbone.View = Backbone.BindTo.View;

}).call(this);