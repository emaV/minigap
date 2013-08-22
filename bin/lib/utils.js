var clc, cp, fs, nopt, path, spawn, _;

_ = require("underscore");

clc = require('cli-color');

fs = require('fs');

path = require("path");

nopt = require("nopt");

cp = require("child_process");

spawn = cp.spawn;

_.mkdirp = require('mkdirp').sync;

_.clc = clc;

_.minimatch = require("minimatch");

_.glob = require("glob").sync;

_.fs = fs;

_.path = path;

_.watch = require('node-watch');

_.touch = require('touch');

_.fork = function(module, args, opts) {
  var child, childName, idx;
  childName = path.basename(module);
  idx = childName.indexOf(".");
  if (idx !== -1) {
    childName = childName.slice(0, idx);
  }
  console.log("[" + childName + "] Forking ..");
  child = cp.fork(module, args, opts);
  child.on("exit", function(c) {
    return console.log("[" + childName + "] Exiting with code " + c);
  });
  child.on("error", function(e) {
    return console.error("[" + childName + "] Error: " + e);
  });
  process.on("exit", function() {
    console.log("[" + childName + "] Killing ..");
    return child.kill();
  });
  return child;
};

_.mark = function(t) {
  var r;
  r = {};
  if (t != null) {
    r.hr = process.hrtime(t.hr);
  } else {
    r.hr = process.hrtime();
  }
  r.toString = function() {
    var n, ns, s;
    s = r.hr[0];
    n = r.hr[1];
    ns = ("00000000" + n).slice(-9).slice(0, 3);
    return "" + s + "." + ns + " s";
  };
  return r;
};

_.isSubpath = function(parent, contained) {
  parent = path.resolve(parent);
  contained = path.resolve(contained);
  return contained.slice(0, parent.length) === parent;
};

_.spawn = function(cmd, args, opts) {
  var child, childName, color, err, formatData, pre;
  childName = (opts && opts.as) || path.basename(cmd);
  pre = "[" + childName + "]";
  if (opts && opts.color) {
    color = clc[opts.color] || clc["white"];
    pre = color.bold(pre);
    err = color.bold(pre + "*");
  }
  formatData = function(pre, msg) {
    return ("" + pre + " " + msg).replace(/\n+$/, "").replace(/\n+/g, "\n" + pre + " ");
  };
  child = spawn(cmd, args, opts);
  child.stdout.on("data", function(data) {
    return console.log(formatData(pre, data.toString()));
  });
  child.stderr.on("data", function(data) {
    return console.error(formatData(err, data.toString()));
  });
  return child;
};

_.parseArgv = function() {
  return nopt({}, {}, process.argv, 2);
};

_.quoteRe = function(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
};

_.error = function(msg) {
  return console.log(clc.red("[ERROR] " + msg));
};

_.fatal = function(msg) {
  _.error(msg);
  return process.exit(1);
};

_.warn = function(msg) {
  return console.log(clc.yellow("[WARN] " + msg));
};

_.success = function(msg) {
  return console.log(clc.green("[SUCCESS] " + msg));
};

_.deleteFolderRecursive = function(path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function(file, index) {
      var curPath;
      curPath = path + "/" + file;
      if (fs.statSync(curPath).isDirectory()) {
        return deleteFolderRecursive(curPath);
      } else {
        return fs.unlinkSync(curPath);
      }
    });
    return fs.rmdirSync(path);
  }
};

_.copyFileSync = function(srcFile, destFile) {
  var BUF_LENGTH, buff, bytesRead, destDir, fdr, fdw, pos, stats;
  stats = fs.statSync(srcFile);
  if (!stats.isFile()) {
    return false;
  }
  BUF_LENGTH = 64 * 1024;
  buff = new Buffer(BUF_LENGTH);
  fdr = fs.openSync(srcFile, 'r');
  destDir = path.dirname(destFile);
  if (!fs.existsSync(destDir)) {
    if (!_.mkdirp(destDir)) {
      throw "Can't create " + destDir;
    }
  }
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

module.exports = _;
