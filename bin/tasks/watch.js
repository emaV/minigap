var Builder,
  __slice = [].slice;

Builder = require("../lib/builder");

module.exports = function(runner) {
  return runner.task("watch", "Watch for changes on the source code and rebuild the changed sources only", {}, {}, function() {
    var builder, targets;
    targets = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    this.h.check();
    builder = new Builder(targets, this.options);
    return builder.watch();
  });
};
