var env, yeoman;

yeoman = require('yeoman-generator');

env = yeoman();

module.exports = function(runner) {
  return runner.task("new", "Create a new minigap application", {}, {}, function(appPath) {
    var absPath, appName, done, generatorPath;
    absPath = this.h.path.resolve(appPath);
    appName = this.h.path.basename(appPath);
    if (appPath == null) {
      this.h.fatal("You should provide a PATH");
    }
    if (this.h.fs.existsSync(appPath)) {
      this.h.fatal("Path '" + appPath + "' already exists.");
    }
    if (!this.h.mkdirp(appPath)) {
      this.h.fatal("An error occurred while creating path: " + appPath);
    }
    generatorPath = this.h.path.resolve(__dirname, "../../generators");
    process.chdir(appPath);
    env.appendPath(generatorPath);
    env.lookup(generatorPath);
    done = function() {
      return runner.h.success("done!");
    };
    if (this.options.js) {
      return env.run('app', {
        js: true
      }, done);
    } else {
      return env.run('app', {
        coffee: true
      }, done);
    }
  });
};
