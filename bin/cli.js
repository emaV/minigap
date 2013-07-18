#!/usr/bin/env node

;
var clc, cmd, command, commands, fs, mkdirp, ncp, nopt, options, path, run, sh,
  __slice = [].slice;

nopt = require("nopt");

ncp = require("ncp").ncp;

path = require("path");

fs = require("fs");

clc = require('cli-color');

sh = require('execSync');

mkdirp = require('mkdirp');

options = nopt({}, {}, process.argv, 2);

run = function() {
  var args, cmd;
  cmd = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
  return commands[cmd].run.apply(null, args);
};

commands = {
  "new": {
    description: "Create a new minigap application",
    run: function(appPath) {
      var absPath, appName, done, env, generatorPath, yeoman;
      absPath = path.resolve(appPath);
      appName = path.basename(appPath);
      if (!mkdirp.sync(appPath)) {
        console.log(clc.red("An error occurred while creating path: " + appPath + "\n"));
        process.exit(1);
      }
      generatorPath = path.resolve(__dirname, "../generators");
      process.chdir(appPath);
      yeoman = require('yeoman-generator');
      env = yeoman();
      env.appendPath(generatorPath);
      env.lookup(generatorPath);
      done = function() {
        return console.log(clc.green("done!"));
      };
      if (options.coffee) {
        return env.run('app', {
          coffee: true
        }, done);
      } else {
        return env.run('app', {
          js: true
        }, done);
      }
    }
  },
  check: {
    description: "Checks if current folder is inside a minigap project",
    run: function() {
      if (!fs.existsSync(".minigap")) {
        console.log(clc.red("              \n" + (clc.red('[ERROR]')) + " This is not a minigap project root.\n"));
        return process.exit(1);
      } else {
        return true;
      }
    }
  },
  build: {
    description: "Build the application",
    run: function() {
      var builder, builderAdapter, configPath, files, preproc, readConf;
      commands.check.run();
      require("coffee-script");
      configPath = path.resolve("./config/build");
      readConf = require(configPath);
      preproc = require('preproc');
      builder = null;
      files = {};
      builderAdapter = {
        root: function(src) {
          return path.resolve(".", src);
        },
        config: function(config) {
          return builder = new preproc.Builder(config);
        },
        build: function(from, to) {
          return files[from] = to;
        }
      };
      readConf(builderAdapter);
      return console.log(builder);
    }
  },
  watch: {
    description: "Watch for changes on the source code and rebuild the application",
    run: function() {
      var filter, watch, www;
      commands.check.run();
      watch = require('node-watch');
      filter = function(pattern, fn) {
        return function(filename) {
          if (pattern.test(filename)) {
            return fn(filename);
          }
        };
      };
      www = path.resolve('./www');
      console.log(clc.green("Watching for changes in " + www));
      return watch('./www', filter(/\.(coffee|html|js)$/, function(filename) {
        return commands.build.run();
      }));
    }
  },
  help: {
    description: "Display this screen of help",
    run: function() {
      var command, name, padded_name;
      console.log("\nUSAGE: \n  minigap COMMAND\n\nCOMMANDS:");
      for (name in commands) {
        command = commands[name];
        padded_name = ("            " + name).slice(-10);
        console.log("" + padded_name + "       " + command.description);
      }
      return console.log("");
    }
  }
};

cmd = options.argv.remain.shift();

command = commands[cmd];

if (command == null) {
  commands.help.run();
  process.exit(1);
}

command.run.apply(null, options.argv.remain);
