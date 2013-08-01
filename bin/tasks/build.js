var Builder,
  __slice = [].slice;

Builder = require("../lib/builder");

module.exports = function(runner) {
  return runner.task("build", "Build application", {}, {}, function() {
    var builder, targets;
    targets = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    this.h.check();
    builder = new Builder(targets, this.options);
    return builder.build();
  });
};
