#!/usr/bin/env node

;
var OPTIONS, clc, cmd, command, commands, fs, getAllTargets, mkdirp, ncp, nopt, options, path, quoteRe, readBuildConfig, run, sh,
  __slice = [].slice,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

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

readBuildConfig = function(options) {
  var configPath, preproc, readConf;
  if (options == null) {
    options = {};
  }
  require("coffee-script");
  configPath = path.resolve("./config/build");
  readConf = require(configPath);
  preproc = require('preproc');
  readConf({
    sourcePath: function(p) {
      return path.resolve(".", p);
    },
    config: function(conf) {
      var k, v, _results;
      _results = [];
      for (k in conf) {
        v = conf[k];
        _results.push(options[k] = v);
      }
      return _results;
    }
  });
  return options;
};

quoteRe = function(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
};

getAllTargets = function() {
  var dirs, file, files, stats, _i, _len;
  files = fs.readdirSync("targets");
  dirs = [];
  for (_i = 0, _len = files.length; _i < _len; _i++) {
    file = files[_i];
    stats = fs.statSync(path.resolve("targets", file));
    if (stats.isDirectory()) {
      dirs.push(file);
    }
  }
  return dirs;
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
      var builder, dir, dstf, file, files, paths, preproc, srcf, target, targets, _i, _len, _results;
      targets = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      commands.check.run();
      options = readBuildConfig();
      files = options.files || [];
      paths = options.paths || [path.resolve("./lib")];
      paths.unshift(path.resolve("."));
      delete options.files;
      delete options.paths;
      options.resolver = {
        resolve: function(p) {
          var base, resolved, _i, _len;
          for (_i = 0, _len = paths.length; _i < _len; _i++) {
            base = paths[_i];
            resolved = path.resolve(base, p);
            if (fs.existsSync(resolved)) {
              return resolved;
            }
          }
          throw "Unable to resolve '" + p + "' to an existing path.";
        }
      };
      preproc = require("preproc");
      builder = new preproc.Builder(options);
      if (targets.length === 0) {
        targets = getAllTargets();
      }
      if (OPTIONS["dist"]) {
        builder.env.production = true;
        builder.env.development = false;
        dir = "dist";
      } else {
        builder.env.development = true;
        builder.env.production = false;
        dir = "dev";
      }
      _results = [];
      for (_i = 0, _len = targets.length; _i < _len; _i++) {
        target = targets[_i];
        _results.push((function() {
          var _j, _len1, _results1;
          _results1 = [];
          for (_j = 0, _len1 = files.length; _j < _len1; _j++) {
            file = files[_j];
            srcf = path.resolve("www", file);
            dstf = path.resolve("targets", target, dir, "www", file);
            builder.env.target = target;
            _results1.push(builder.build(srcf, dstf));
          }
          return _results1;
        })());
      }
      return _results;
    }
  },
  watch: {
    description: "Watch for changes on the source code and rebuild the application",
    run: function() {
      var config, ext, extensions, extensionsRe, extname, filter, opts, targets, type, watch, www, _i, _len, _ref, _ref1;
      targets = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      commands.check.run();
      config = readBuildConfig() || {};
      extensions = [];
      _ref = config.types || {};
      for (type in _ref) {
        opts = _ref[type];
        _ref1 = opts.extensions || [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          ext = _ref1[_i];
          extname = ext.slice(0, 1) === "." ? ext.slice(1) : ext;
          if (__indexOf.call(extensions, extname) < 0) {
            extensions.push(quoteRe(extname));
          }
        }
      }
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
