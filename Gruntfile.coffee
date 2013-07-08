module.exports = (grunt) ->
  grunt.initConfig
    pkg: grunt.file.readJSON("package.json")

    sprockets:
      src_path: './src'
      dst_path: 'dist/minigap'
      src: [ 'minigap.coffee' ]
      compile:
        options:
          bare: true

    watch:
      files: ["src/**/*.coffee"]
      tasks: ["build"]
  
    copy:      
      main: 
        files: [ {expand: true, cwd: 'src', src: ['package.json', 'Gruntfile.coffee'], dest: 'dist/', filter: 'isFile'} ]

  grunt.loadNpmTasks "grunt-contrib-coffee"
  grunt.loadNpmTasks "grunt-contrib-watch"
  grunt.loadNpmTasks "grunt-contrib-copy"

  grunt.registerTask "build", [ "sprockets", "copy" ]
  grunt.registerTask "default", ["build"]

  grunt.registerTask 'sprockets', 'sprockets', ->
    SprocketsChain  = require "sprockets-chain"
    path            = require 'path'
    o               = grunt.config.get 'sprockets'
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