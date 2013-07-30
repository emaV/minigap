#!/usr/bin/env node

;
var OPTIONS, clc, cmd, command, commands, fs, mkdirp, ncp, nopt, options, path, readBuildConfig, run, sh,
  __slice = [].slice;

nopt = require("nopt");

ncp = require("ncp").ncp;

path = require("path");

fs = require("fs");

clc = require('cli-color');

sh = require('execSync');

mkdirp = require('mkdirp');

options = nopt({}, {}, process.argv, 2);

OPTIONS = options;

run = function() {
  var args, cmd;
  cmd = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
  return commands[cmd].run.apply(null, args);
};

readBuildConfig = require("./config");

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
      var config, targets;
      targets = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      commands.check.run();
      config = readBuildConfig();
      return config.build();
    }
  },
  watch: {
    description: "Watch for changes on the source code and rebuild the application",
    run: function() {
      var config, extensions, extensionsRe, filter, targets, watch, www;
      targets = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      commands.check.run();
      config = readBuildConfig();
      extensions = config.knownExtensions();
      extensionsRe = extensions.join("|");
      watch = require('node-watch');
      filter = function(pattern, fn) {
        return function(filename) {
          if (pattern.test(filename)) {
            return fn(filename);
          }
        };
      };
      www = path.resolve('./www');
      console.log(clc.green("Watching for source changes in " + www));
      return watch('./www', filter(new RegExp("\\.(" + extensionsRe + ")$"), function(filename) {
        return commands.build.run.apply(null, targets);
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
