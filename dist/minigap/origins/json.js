
//= require "./origin.js"
;
var _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Minigap.JsonOrigin = (function(_super) {
  __extends(JsonOrigin, _super);

  function JsonOrigin() {
    _ref = JsonOrigin.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  JsonOrigin.prototype.doRequest = function(url, params, options, func) {
    var req;
    return req = Minigap.ajax({
      url: url,
      data: params || {},
      type: (options.type || "GET").toUpperCase(),
      error: function(e) {
        throw e;
      },
      success: function(resp) {
        if (typeof resp === 'string') {
          resp = JSON.parse(resp);
        }
        return func(resp);
      }
    });
  };

  JsonOrigin.prototype.doMerge = function(responses) {
    var r, res, _i, _len;
    res = {};
    for (_i = 0, _len = responses.length; _i < _len; _i++) {
      r = responses[_i];
      res[r.request.name] = r.response;
    }
    return res;
  };

  return JsonOrigin;

})(Minigap.Origin);
