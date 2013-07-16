#!/usr/bin/env node

;
var clc, cmd, command, commands, fs, mkdirp, ncp, nopt, options, path, sh;

nopt = require("nopt");

ncp = require("ncp").ncp;

path = require("path");

fs = require("fs");

clc = require('cli-color');

sh = require('execSync');

mkdirp = require('mkdirp');

options = nopt({}, {}, process.argv, 2);

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
    description: "Check if current folder is ready to install",
    run: function(options) {
      var already_installed, res, stats1, stats2;
      if (options == null) {
        options = {
          log: true
        };
      }
      res = false;
      try {
        stats1 = fs.lstatSync("www");
        stats2 = fs.lstatSync("cordova");
        already_installed = fs.existsSync("minigap");
        res = stats1.isDirectory() && stats2.isDirectory() && !already_installed;
      } catch (_error) {}
      if (options.log) {
        if (res) {
          console.log("\n" + (clc.green('[VALID]')) + " This is a PhoneGap project root and can be used to install minigap.\n");
        } else {
          if (already_installed) {
            console.log(clc.red("\n" + (clc.red('[INVALID]')) + " It seems that minigap is already installed here.\n\nUse 'minigap init --force' to proceed with installation anyway.\n"));
          } else {
            console.log(clc.red("\n" + (clc.red('[INVALID]')) + " This is not a PhoneGap project root and may be unsuitable to install minigap.\n\nUse 'minigap init --force' to proceed with installation anyway.\n"));
          }
        }
      }
      return res;
    }
  },
  build: {
    description: "Build the application",
    run: function() {
      var builder;
      return builder = new Coffeebuild.Builder()["with"]("coffee").source("minigap/app.coffee").coffee().store("www/js/app.js")["do"](function(task) {
        console.log(clc.green("done!"));
        return task.done();
      });
    }
  },
  watch: {
    description: "Watch for changes on the source code and rebuild the application",
    run: function() {
      var filter;
      filter = function(pattern, fn) {
        return function(filename) {
          if (pattern.test(filename)) {
            return fn(filename);
          }
        };
      };
      return watch('./minigap', filter(/\.(coffee|html|js)$/, function(filename) {
        return console.log("File Cambiato");
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

console.log(cmd);

command = commands[cmd];

if (command == null) {
  commands.help.run();
  process.exit(1);
}

command.run.apply(null, options.argv.remain);
