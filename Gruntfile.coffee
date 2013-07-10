module.exports = (grunt) ->
  grunt.initConfig
    pkg: grunt.file.readJSON("package.json")

    dist:
      src_path: './src'
      dst_path: 'dist/minigap/lib'
      src: [ 'minigap.coffee' ]
      compile:
        options:
          bare: true

    cli:
      src_path: './src/cli'
      dst_path: 'bin'
      src: [ 'cli.coffee' ]
      compile:
        options:
          bare: true

    watch:
      files: ["src/**/*.coffee"]
      tasks: ["build"]
  
    copy:      
      main: 
        files: [ {expand: true, cwd: 'src', src: ['Gruntfile.js'], dest: 'dist/', filter: 'isFile'} ]

  grunt.loadNpmTasks "grunt-contrib-coffee"
  grunt.loadNpmTasks "grunt-contrib-watch"
  grunt.loadNpmTasks "grunt-contrib-copy"

  grunt.registerTask "build", [ "dist", "cli" ]
  grunt.registerTask "gruntfile", ["copy"]
  grunt.registerTask "default", ["build"]

  grunt.registerTask 'dist', 'dist', ->
    SprocketsChain  = require "sprockets-chain"
    path            = require 'path'
    o               = grunt.config.get 'dist'
    o.compile.files = o.compile.files || {}
    
    for src in o.src
      grunt.file.setBase o.src_path
      files = grunt.file.expand(src)

      files.forEach (f, i)->
        p = path.basename f, path.extname(f)
        grunt.file.setBase __dirname
        sc = new SprocketsChain()
        sc.appendPath o.src_path
        o.compile.files[path.join(__dirname, o.dst_path, p + '.js')] = sc.depChain(f)

    grunt.config.set 'coffee', o
    grunt.task.run 'coffee:compile'

  grunt.registerTask 'cli', 'cli', ->
    SprocketsChain  = require "sprockets-chain"
    path            = require 'path'
    o               = grunt.config.get 'cli'
    o.compile.files = o.compile.files || {}
    
    for src in o.src
      grunt.file.setBase o.src_path
      files = grunt.file.expand(src)

      files.forEach (f, i)->
        p = path.basename f, path.extname(f)
        grunt.file.setBase __dirname
        sc = new SprocketsChain()
        sc.appendPath o.src_path
        o.compile.files[path.join(__dirname, o.dst_path, p + '.js')] = sc.depChain(f)

    grunt.config.set 'coffee', o
    grunt.task.run 'coffee:compile'

