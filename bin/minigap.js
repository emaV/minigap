#!/usr/bin/env node

;
var Runner, args, options, runner, taskName, _;

_ = require("./lib/utils");

Runner = require("./lib/runner");

options = _.parseArgv();

taskName = options.argv.remain.shift();

args = options.argv.remain;

runner = new Runner("minigap", options);

_.each(_.glob(_.path.resolve(__dirname, "tasks/*")), function(p) {
  var conf;
  p.slice(0, p.indexOf("."));
  conf = require(p);
  if (typeof conf === "function") {
    return conf(runner);
  }
});

runner.run(taskName, args);
