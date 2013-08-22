_      = require("underscore")
clc    = require('cli-color')
fs     = require('fs')
path   = require("path")
nopt    = require("nopt")
cp    = require("child_process")
spawn = cp.spawn

_.mkdirp = require('mkdirp').sync
_.clc = clc
_.minimatch = require "minimatch"
_.glob      = require("glob").sync
_.fs        = fs
_.path      = path
_.watch     = require('node-watch')
_.touch     = require('touch')

_.fork = (module, args, opts) ->
  
  childName = path.basename(module)
  idx = childName.indexOf(".")
  if idx != -1
    childName = childName.slice(0, idx)
  
  console.log "[#{childName}] Forking .."
  child = cp.fork(module, args, opts)
  
  child.on "exit", (c)->  
    console.log "[#{childName}] Exiting with code #{c}"

  child.on "error", (e)->  
    console.error "[#{childName}] Error: #{e}"
 
  process.on "exit", ->
    console.log "[#{childName}] Killing .."
    child.kill()

  child

_.mark = (t) ->
  r = {}
  if t?
    r.hr = process.hrtime(t.hr)
  else
    r.hr = process.hrtime()

  r.toString = ->
    s = r.hr[0]
    n = r.hr[1]
    ns = "00000000#{n}".slice(-9).slice(0, 3)
    "#{s}.#{ns} s"
  
  r

_.isSubpath = (parent, contained) ->
  parent = path.resolve(parent)
  contained = path.resolve(contained)
  contained.slice(0, parent.length) == parent

_.spawn = (cmd, args, opts) ->  

  childName = (opts and opts.as) or path.basename(cmd)
  pre = "[#{childName}]"
  if opts and opts.color
    color = clc[opts.color] or clc["white"]
    pre   = color.bold(pre)
    err = color.bold(pre + "*")

  formatData = (pre, msg) ->
    "#{pre} #{msg}".replace(/\n+$/, "").replace(/\n+/g, "\n#{pre} ")
    
  child = spawn(cmd, args, opts)

  child.stdout.on "data", (data) ->
    console.log formatData(pre, data.toString())

  child.stderr.on "data", (data) ->
    console.error formatData(err, data.toString())

  child

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