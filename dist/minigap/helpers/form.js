var __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

(function() {
  var CollectionFormHelper, FORM_NAMES_STACK, FormHelper, FormHelpers, FormNamesStack, k, v, _results;
  FormNamesStack = (function() {
    function FormNamesStack() {
      this.stack = [];
    }

    FormNamesStack.prototype.push = function(name) {
      return this.stack.push(name);
    };

    FormNamesStack.prototype.pop = function() {
      return this.stack.pop();
    };

    FormNamesStack.prototype.join = function() {
      return this.stack.join();
    };

    FormNamesStack.prototype.shift = function() {
      return this.stack.shift();
    };

    FormNamesStack.prototype.unshift = function() {
      return this.stack.unshift();
    };

    FormNamesStack.prototype.isRoot = function() {
      return this.stack.length === 1;
    };

    FormNamesStack.prototype.isEmpty = function() {
      return this.stack.length === 0;
    };

    FormNamesStack.prototype.length = function() {
      return this.stack.length;
    };

    FormNamesStack.prototype.clone = function() {
      return this.stack.slice(0);
    };

    return FormNamesStack;

  })();
  FORM_NAMES_STACK = new FormNamesStack();
  FormHelper = (function() {
    FormHelper.render = function(context, name, hb_options, options) {
      var fh;
      fh = new FormHelper(context, name, hb_options, options);
      return fh.render();
    };

    function FormHelper(context, name, hb_options, options) {
      var input_options, label_param, reserved, reserved_params, value_method, value_property, _i, _len;
      this.context = context;
      this.name = name;
      this.hb_options = hb_options;
      input_options = hb_options.hash;
      value_method = input_options.value_method;
      value_property = input_options.value_property;
      delete input_options.value_method;
      delete input_options.value_property;
      label_param = options.label_param || "label";
      reserved_params = options.extract || [];
      this._render_fn = options.render;
      this._yield = options["yield"];
      this.label = input_options[label_param];
      delete input_options[label_param];
      for (_i = 0, _len = reserved_params.length; _i < _len; _i++) {
        reserved = reserved_params[_i];
        this[reserved] = input_options[reserved];
        delete input_options[reserved];
      }
      if ((input_options["class"] != null) && typeof input_options["class"] === "string") {
        input_options["class"] = input_options["class"].split(new RegExp(" +"));
      }
      if (value_method != null) {
        this.value = context[value_method].call(context);
      } else if (value_property != null) {
        this.value = context[value_property];
      } else {
        this.value = context[name];
      }
      if (this.value == null) {
        this.value = "";
      }
      this.attrs = input_options;
      this._computeNameAndIdAttribute();
    }

    FormHelper.prototype.isRoot = function() {
      return FORM_NAMES_STACK.isRoot();
    };

    FormHelper.prototype.render = function() {
      var block_val, retval;
      if (this._yield) {
        FORM_NAMES_STACK.push(this.name);
        block_val = this.hb_options.fn(this.value);
        FORM_NAMES_STACK.pop();
      }
      retval = this._render_fn.apply(this, [block_val]);
      return new Handlebars.SafeString(retval);
    };

    FormHelper.prototype._computeNameAndIdAttribute = function() {
      var fns;
      if (!this._yield) {
        fns = FORM_NAMES_STACK.clone();
        fns.push(this.name);
        if (this.attrs.id == null) {
          this.attrs.id = fns.join("_");
        }
        if (this.attrs.name == null) {
          this.attrs.name = fns.shift();
          if (fns.length > 0) {
            return this.attrs.name = this.attrs.name + "[" + fns.join("][") + "]";
          }
        }
      }
    };

    FormHelper.prototype.attributes = function(cursor) {
      var ary, k, v, _ref;
      ary = [];
      _ref = this.attrs;
      for (k in _ref) {
        v = _ref[k];
        if (k === "class") {
          ary.push("class=\"" + (v.join(' ')) + "\"");
        }
        if ((cursor != null) && k === "id") {
          ary.push("" + k + "=\"" + v + "_" + cursor + "\"");
        } else {
          ary.push("" + k + "=\"" + v + "\"");
        }
      }
      return ary.join(" ");
    };

    return FormHelper;

  })();
  CollectionFormHelper = (function(_super) {
    __extends(CollectionFormHelper, _super);

    CollectionFormHelper.render = function(context, name, hb_options, options) {
      var fh;
      fh = new CollectionFormHelper(context, name, hb_options, options);
      return fh.render();
    };

    function CollectionFormHelper(context, name, hb_options, options) {
      var default_idx, e, i, idx, item, selected_idx, _i, _j, _k, _len, _len1, _len2, _ref, _ref1;
      if (options.extract == null) {
        options.extract = [];
      }
      _ref = ["collection", "selected", "collection_value", "collection_label", "blank", "default"];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        i = _ref[_i];
        options.extract.push(i);
      }
      hb_options.hash.collection_value = hb_options.hash.collection_value || 0;
      hb_options.hash.collection_label = hb_options.hash.collection_label || 1;
      CollectionFormHelper.__super__.constructor.call(this, context, name, hb_options, options);
      if (this.collection == null) {
        this.collection = [];
      }
      this.original_collection = this.collection;
      this.collection = [];
      if (this.selected == null) {
        this.selected = this.value;
      }
      if (options.multiple) {
        this.attrs.name = this.attrs.name + "[]";
      }
      if (!$.isArray(this.selected)) {
        this.selected = this.selected != null ? [this.selected] : [];
      }
      if (!$.isArray(this["default"])) {
        this["default"] = this["default"] != null ? [this["default"]] : [];
      }
      default_idx = [];
      selected_idx = [];
      i = 0;
      _ref1 = this.original_collection;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        item = _ref1[_j];
        e = {};
        if (typeof item === 'object') {
          e.label = item[this.collection_label];
          e.value = item[this.collection_value];
        } else {
          e.label = item;
          e.value = item;
        }
        if ($.inArray(e.value, this.selected) !== -1) {
          selected_idx.push(i);
        }
        if ($.inArray(e.value, this["default"]) !== -1) {
          default_idx.push(i);
        }
        this.collection.push(e);
        i += 1;
      }
      if (selected_idx.length === 0) {
        selected_idx = default_idx;
      }
      if (selected_idx.length > 0) {
        for (_k = 0, _len2 = selected_idx.length; _k < _len2; _k++) {
          idx = selected_idx[_k];
          e = this.collection[idx];
          e.selected = true;
        }
      }
    }

    return CollectionFormHelper;

  })(FormHelper);
  FormHelpers = {
    fieldset: function(name, options) {
      return FormHelper.render(this, name, options, {
        label_param: "legend",
        "yield": true,
        render: function(block) {
          var label_elem, legend_html, wrapper_elem;
          if (this.isRoot) {
            label_elem = "legend";
            wrapper_elem = "fieldset";
          } else {
            label_elem = "div";
            wrapper_elem = "div";
          }
          legend_html = this.label != null ? "<legend class='legend'>" + this.label + "</legend>" : "";
          return "<" + wrapper_elem + " " + (this.attributes()) + ">\n" + legend_html + "\n" + block + "\n</" + wrapper_elem + ">";
        }
      });
    },
    select: function(name, options) {
      return CollectionFormHelper.render(this, name, options, {
        multiple: options.hash.multiple,
        render: function() {
          var item, res, _i, _len, _ref;
          res = "<select " + (this.attributes()) + ">";
          if (this.blank != null) {
            res += "<option value=''>" + blank + "</option>";
          }
          _ref = this.collection;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            item = _ref[_i];
            res += "<option value='" + item.value + "'";
            if (item.selected) {
              res += " selected='selected'";
            }
            res += ">" + item.label + "</option>";
          }
          res += "</select>";
          return res;
        }
      });
    },
    select_day: function(name, options) {
      var _i, _results;
      options.hash.collection = (function() {
        _results = [];
        for (_i = 1; _i <= 31; _i++){ _results.push(_i); }
        return _results;
      }).apply(this);
      return Handlebars.helpers.select.apply(this, [name, options]);
    },
    select_month: function(name, options) {
      options.hash.collection = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      return Handlebars.helpers.select.apply(this, [name, options]);
    },
    select_year: function(name, options) {
      var endYear, now, startYear, _i, _results;
      now = new Date();
      startYear = options.hash.startYear || now.getFullYear() - 50;
      endYear = options.hash.endYear || now.getFullYear() + 50;
      delete options.hash.startYear;
      delete options.hash.endYear;
      options.hash.collection = (function() {
        _results = [];
        for (var _i = startYear; startYear <= endYear ? _i <= endYear : _i >= endYear; startYear <= endYear ? _i++ : _i--){ _results.push(_i); }
        return _results;
      }).apply(this);
      return Handlebars.helpers.select.apply(this, [name, options]);
    },
    checkboxes: function(name, options) {
      return CollectionFormHelper.render(this, name, options, {
        multiple: true,
        render: function() {
          var i, item, res, _i, _len, _ref;
          res = "<div>";
          i = 0;
          _ref = this.collection;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            item = _ref[_i];
            i += 1;
            res += "<div><label for=\"" + this.attrs.id + "_" + i + "\" >";
            res += "<input type=\"checkbox\" value='" + item.value + "' " + (this.attributes(i));
            if (item.selected) {
              res += " checked='checked'";
            }
            res += " /> " + item.label + "</label></div>";
          }
          res += "</div>";
          return res;
        }
      });
    },
    checkbox: function(name, options) {},
    textarea: function(name, options) {
      return FormHelper.render(this, name, options, {
        render: function() {
          var res;
          res = "";
          if (this.label != null) {
            res += "<label class=\"control-label\" for=\"" + this.attrs.id + "\">" + this.label + "</label>";
          }
          res += "<div class=\"controls\">";
          res += "   <textarea " + (this.attributes()) + ">" + this.value + "</textarea>";
          return res += "</div>";
        }
      });
    },
    input: function(name, options) {
      return FormHelper.render(this, name, options, {
        render: function() {
          var res;
          res = "";
          if (this.label != null) {
            res += "<label class=\"control-label\" for=\"" + this.attrs.id + "\">" + this.label + "</label>";
          }
          res += "<div class=\"controls\">";
          res += "   <input " + (this.attributes()) + " value=\"" + this.value + "\" />";
          return res += "</div>";
        }
      });
    }
  };
  _results = [];
  for (k in FormHelpers) {
    v = FormHelpers[k];
    _results.push(Handlebars.registerHelper(k, v));
  }
  return _results;
})(Handlebars);
