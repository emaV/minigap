module.exports = (grunt) ->
  grunt.initConfig
    pkg: grunt.file.readJSON("package.json")

    dist:
      src_path: './src'
      dst_path: 'dist/'
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

    generator:
      copy:
        main: 
          files: [
            {
              expand: true
              cwd: "src/generator/"
              src: ["**"]
              dest: "generators/app/templates/coffee/"
            }
          ]

      coffee:
        compile:
          expand: true,
          cwd: './generators/app/templates/coffee',
          src: ['**/*.coffee'],
          dest: './generators/app/templates/js',
          ext: '.js'
          options:
            bare: true

      replace:
        js:
          src: './generators/app/templates/js/**/*.js'
          actions: [
            {
              search: 'APP_MAIN',
              replace: 'app.js',
              flags: 'g'
            },
            {
              search: '#= include <lib/minigap.js>;'
              replace: '//= include <lib/minigap.js>'
              flags: 'g'
            },
            {
              search: '#= if development;'
              replace: '//= if development'
              flags: 'g'
            },
            {
              search: '#= end;'
              replace: '//= end'
              flags: 'g'
            },
            {
              search: '#='
              replace: '//='
              flags: 'g'
            }
          ]
        coffee:
          src: './generators/app/templates/coffee/**/*.coffee'
          actions: [
            {
              search: 'APP_MAIN',
              replace: 'app.coffee',
              flags: 'g'
            },
            {
              search: '`'
              replace: ''
              flags: 'g'
            }
          ]

    watch:
      files: ["src/**/*.coffee"]
      tasks: ["build"]
  

  grunt.loadNpmTasks "grunt-contrib-coffee"
  grunt.loadNpmTasks "grunt-contrib-watch"
  grunt.loadNpmTasks 'grunt-contrib-copy'
  grunt.loadNpmTasks 'grunt-regex-replace'
  

  grunt.registerTask "build", ["dist", "cli", "generator"]
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

  grunt.registerTask 'generator', 'generator', ->

    opts = grunt.config.get( 'generator' )
    grunt.config.set 'copy', opts.copy
    grunt.task.run 'copy'

    grunt.config.set 'coffee', opts.coffee
    grunt.task.run 'coffee:compile'

    grunt.config.set 'regex-replace', opts.replace
    grunt.task.run 'regex-replace'
