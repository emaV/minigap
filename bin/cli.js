#!/usr/bin/env node

;
var OPTIONS, build, clc, cmd, command, commands, copyFileSync, error, fs, mkdirp, nopt, options, parseBuildArgs, path, readBuildConfig, run, sh, success, warn, watch, wrench,
  __slice = [].slice;

nopt = require("nopt");

wrench = require("wrench");

path = require("path");

fs = require("fs");

clc = require('cli-color');

sh = require('execSync');

mkdirp = require('mkdirp');

watch = require('node-watch');

options = nopt({}, {}, process.argv, 2);

OPTIONS = options;

run = function() {
  var args, cmd;
  cmd = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
  return commands[cmd].run.apply(null, args);
};

readBuildConfig = require("./config");

error = function(msg) {
  console.log(clc.red("[ERROR] " + msg));
  return process.exit(1);
};

warn = function(msg) {
  return console.log(clc.yellow("[WARN] " + msg));
};

success = function(msg) {
  return console.log(clc.green("[SUCCESS] " + msg));
};

parseBuildArgs = function(config, targets, options) {
  var allEnvs, envs, firstEnv, invalidEnvs, invalidTargets;
  envs = null;
  if (options.env == null) {
    allEnvs = config.getAllEnvironments();
    if (allEnvs.length === 0) {
      error("There is no environment declared in your configuration.");
    }
    firstEnv = allEnvs[0];
    envs = [firstEnv];
    warn("No environment specified: assuming '" + firstEnv + "'");
  } else {
    envs = options.env.split(",");
    invalidEnvs = config.findInvalidEnvs(envs);
    if (invalidEnvs.length > 0) {
      error("Unknown environment" + (invalidEnvs.length > 1 ? 's' : '') + ": " + (invalidEnvs.join(', ')));
    }
  }
  if (targets.length === 0) {
    targets = config.getAllTargets();
    warn("No targets specified: building for all targets..");
  } else {
    invalidTargets = config.findInvalidTargets(targets);
    if (invalidTargets.length > 0) {
      error("Unknown target" + (invalidTargets.length > 1 ? 's' : '') + ": " + (invalidTargets.join(', ')));
    }
  }
  console.log("\n");
  return {
    targets: targets,
    envs: envs
  };
};

copyFileSync = function(srcFile, destFile) {
  var BUF_LENGTH, buff, bytesRead, fdr, fdw, pos;
  BUF_LENGTH = 64 * 1024;
  buff = new Buffer(BUF_LENGTH);
  fdr = fs.openSync(srcFile, 'r');
  fdw = fs.openSync(destFile, 'w');
  bytesRead = 1;
  pos = 0;
  while (bytesRead > 0) {
    bytesRead = fs.readSync(fdr, buff, 0, BUF_LENGTH, pos);
    fs.writeSync(fdw, buff, 0, bytesRead);
    pos += bytesRead;
  }
  fs.closeSync(fdr);
  return fs.closeSync(fdw);
};

build = function(config, envs, targets) {
  var builder, ctx, dstf, e, env, extensions, extensionsRe, files, srcf, target, _i, _len, _results;
  config = readBuildConfig();
  extensions = config.knownExtensions();
  extensionsRe = new RegExp("\\.(" + (extensions.join('|')) + ")$");
  _results = [];
  for (_i = 0, _len = targets.length; _i < _len; _i++) {
    target = targets[_i];
    _results.push((function() {
      var _j, _len1, _results1;
      _results1 = [];
      for (_j = 0, _len1 = envs.length; _j < _len1; _j++) {
        env = envs[_j];
        console.log("Building " + target + ":" + env);
        builder = config.getBuilder();
        ctx = config.getContext(target, env);
        files = config.getFiles(target, env);
        for (srcf in files) {
          dstf = files[srcf];
          builder.env = ctx;
          try {
            if (srcf.match(extensionsRe)) {
              builder.build(srcf, dstf);
            } else if (path.extname(srcf) === path.extname(dstf)) {
              copyFileSync(srcf, dstf);
            } else {
              error("Your configuration does not define how to build " + srcf + " to " + dstf + ".");
            }
          } catch (_error) {
            e = _error;
            if (e.type === "PreprocessorError") {
              console.log("");
              console.log("PreprocessorError: " + e.message);
              console.log("  at " + e.path + ":" + e.line + ":" + e.col);
              console.log("");
              error = true;
              break;
            } else {
              throw e;
            }
          }
        }
        if (env === "dev") {
          fs.writeSync(path.resolve(config.getBase(), ".built_at"), (new Date()).toString());
        }
        if (typeof config.built === "function") {
          config.built(target, env);
        }
        if (typeof config.done === "function") {
          config.done(targets, envs);
        }
        _results1.push(success("Done.\n"));
      }
      return _results1;
    })());
  }
  return _results;
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
      if (options.js) {
        return env.run('app', {
          js: true
        }, done);
      } else {
        return env.run('app', {
          coffee: true
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
      var args, config, targets;
      targets = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      commands.check.run();
      config = readBuildConfig();
      args = parseBuildArgs(config, targets, OPTIONS);
      return build(config, args.envs, args.targets);
    }
  },
  watch: {
    description: "Watch for changes on the source code and rebuild the application",
    run: function() {
      var args, config, sources, targets;
      targets = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      commands.check.run();
      config = readBuildConfig();
      args = parseBuildArgs(config, targets, OPTIONS);
      sources = config.getSources(args.envs, args.targets);
      console.log(clc.green("Watching for changes .."));
      return watch(sources, function(filename) {
        return build(config, args.envs, args.targets);
      });
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
