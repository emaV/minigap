var clc, fs, nopt, path, _;

_ = require("underscore");

clc = require('cli-color');

fs = require('fs');

path = require("path");

nopt = require("nopt");

_.mkdirp = require('mkdirp').sync;

_.clc = clc;

_.minimatch = require("minimatch");

_.glob = require("glob").sync;

_.fs = fs;

_.path = path;

_.watch = require('node-watch');

_.touch = require('touch');

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
  var BUF_LENGTH, buff, bytesRead, destDir, fdr, fdw, pos;
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
