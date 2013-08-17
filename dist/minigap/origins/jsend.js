
//= require "./json.js"
;
var _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Minigap.JSendOrigin = (function(_super) {
  __extends(JSendOrigin, _super);

  function JSendOrigin() {
    _ref = JSendOrigin.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  JSendOrigin.prototype.processResponse = function(response) {
    if (response.status === "success") {
      return response.data;
    } else {
      return {};
    }
  };

  JSendOrigin.prototype.doMerge = function(responses) {
    var obj, prop, r, res, _i, _len, _ref1;
    res = {};
    for (_i = 0, _len = responses.length; _i < _len; _i++) {
      r = responses[_i];
      _ref1 = r.response;
      for (prop in _ref1) {
        obj = _ref1[prop];
        res[prop] = obj;
      }
    }
    return res;
  };

  return JSendOrigin;

})(Minigap.JsonOrigin);
