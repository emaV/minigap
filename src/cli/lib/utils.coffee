_      = require("underscore")
clc    = require('cli-color')
fs     = require('fs')
path   = require("path")
nopt    = require("nopt")
spawn = require("child_process").spawn

_.mkdirp = require('mkdirp').sync
_.clc = clc
_.minimatch = require "minimatch"
_.glob      = require("glob").sync
_.fs        = fs
_.path      = path
_.watch     = require('node-watch')
_.touch     = require('touch')

_.runCmd = (cmd, args, opts = {}, cb) ->

  if opts.cwd
    if not fs.existsSync(opts.cwd)
      throw "The specified working directory '#{opts.cwd}' does not exist."
    else if not fs.statSync(opts.cwd).isDirectory()
      throw "The specified working path '#{opts.cwd}' is not a directory."

  child = spawn(cmd, args or [], opts)

  child.stdout.on "data", (data) ->
    console.log data.toString()

  child.stderr.on "data", (data) ->
    console.error data.toString()

  if cb?
    child.on 'close', cb

_.parseArgv = -> 
  nopt({}, {}, process.argv, 2)

_.quoteRe   = (str) ->
  str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&")

_.error = (msg) ->
  console.log clc.red("[ERROR] #{msg}")

_.fatal = (msg) ->
  _.error(msg)
  process.exit(1)

_.warn = (msg) ->
  console.log clc.yellow("[WARN] #{msg}")

_.success = (msg) ->
  console.log clc.green("[SUCCESS] #{msg}")

_.deleteFolderRecursive = (path) ->
  if fs.existsSync(path)
    fs.readdirSync(path).forEach (file, index) ->
      curPath = path + "/" + file
      if fs.statSync(curPath).isDirectory() # recurse
        deleteFolderRecursive curPath
      else # delete file
        fs.unlinkSync curPath

    fs.rmdirSync path

_.copyFileSync = (srcFile, destFile) ->
  
  stats = fs.statSync(srcFile)
  if not stats.isFile()
    return false

  BUF_LENGTH = 64*1024
  buff = new Buffer(BUF_LENGTH)
  fdr = fs.openSync(srcFile, 'r')

  destDir = path.dirname(destFile)
  if not fs.existsSync(destDir)
    if not _.mkdirp(destDir)
      throw "Can't create #{destDir}"

  fdw = fs.openSync(destFile, 'w')
  bytesRead = 1
  pos = 0
  
  while bytesRead > 0
    bytesRead = fs.readSync(fdr, buff, 0, BUF_LENGTH, pos)
    fs.writeSync(fdw,buff,0,bytesRead)
    pos += bytesRead
  fs.closeSync(fdr)
  fs.closeSync(fdw)

module.exports = _