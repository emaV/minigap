var Runner, _,
  __slice = [].slice;

_ = require("./utils");

Runner = (function() {
  function Runner(programName, options) {
    this.programName = programName;
    this.options = options;
    this.tasks = {};
    this.h = _;
  }

  Runner.prototype.helper = function(name, func) {
    var self;
    self = this;
    return this.h[name] = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return func.apply(self, args);
    };
  };

  Runner.prototype.task = function(name, description, args, options, run) {
    return this.tasks[name] = {
      description: description,
      run: run,
      "arguments": args,
      options: options
    };
  };

  Runner.prototype.run = function(cmd, args) {
    if (this.tasks[cmd] == null) {
      _.error("Wrong arguments.");
      return this.usage();
    } else {
      return this.tasks[cmd].run.apply(this, args);
    }
  };

  Runner.prototype.invoke = function() {
    var args, cmd;
    cmd = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    return this.run(cmd, args);
  };

  Runner.prototype.usage = function() {
    var name, padded_name, task, _ref;
    console.log("\nUSAGE: \n  " + this.programName + " TASK\n\nTASKS:\n");
    _ref = this.tasks;
    for (name in _ref) {
      task = _ref[name];
      padded_name = ("            " + name).slice(-10);
      console.log("" + padded_name + "       " + task.description);
    }
    return console.log("");
  };

  return Runner;

})();

module.exports = Runner;
