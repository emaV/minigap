var _;

_ = require("../lib/utils");

module.exports = function(runner) {
  return runner.task("help", "Display this screen of help", {}, {}, function() {
    return runner.usage();
  });
};
