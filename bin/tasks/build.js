var Builder,
  __slice = [].slice;

Builder = require("../lib/builder");

module.exports = function(runner) {
  return runner.task("build", "Build application", {}, {}, function() {
    var targets;
    targets = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    this.h.check();
    return Builder.build(targets, this.options);
  });
};
