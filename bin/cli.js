#!/usr/bin/env node

;
var Coffeebuild, clc, command, commands, fs, ncp, nopt, options, path, watch, wget;

nopt = require("nopt");

ncp = require("ncp").ncp;

path = require("path");

fs = require("fs");

clc = require('cli-color');

wget = require('wget');

Coffeebuild = require('coffeebuild');

watch = require('node-watch');

options = nopt({}, {}, process.argv, 2);

commands = {
  init: {
    description: "Initialize the application from the PhoneGap root",
    run: function() {
      var destination, source;
      if (!commands.check.run({
        log: false
      }) && (options.force == null)) {
        console.log("\nThis folder is not suitable to be used as minigap installation target. \nUse 'minigap check' to obtain more information about this inconvenient or \nrepeat 'minigap init' with '--force' flag to continue anyway.\n");
        process.exit(1);
      }
      source = path.resolve(path.dirname(fs.realpathSync(__filename)), '../dist');
      destination = ".";
      return ncp(source, destination, function(err) {
        var download;
        if (err) {
          console.error(err);
          return process.exit(1);
        } else {
          fs.openSync("minigap/app.coffee", 'w');
          if (!options["skip-handlebars"]) {
            download = wget.download("https://raw.github.com/wycats/handlebars.js/1.0.0/dist/handlebars.runtime.js", './minigap/lib/handlebars.runtime.js');
            download.on('error', function(err) {
              console.log(err);
              return process.exit(1);
            });
            return download.on('end', function() {
              return console.log(clc.green("done!"));
            });
          } else {
            return console.log(clc.green("done!"));
          }
        }
      });
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

command = commands[options.argv.remain[0]];

if (command == null) {
  commands.help.run();
  process.exit(1);
}

command.run();
