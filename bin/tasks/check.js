module.exports = function(runner) {
  return runner.helper("check", function() {
    if (!this.h.fs.existsSync(".minigap")) {
      return this.h.fatal("This is not a minigap project root");
    } else {
      return true;
    }
  });
};
