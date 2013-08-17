module.exports = (grunt) ->
  fs = require("fs")

  grunt.initConfig
    pkg: grunt.file.readJSON("package.json")

    coffee:
      cli:
        expand: true,
        cwd: './src/cli',
        src: ['**/*.coffee'],
        dest: './bin',
        ext: '.js'
        options:
          bare: true

      dist:
        expand: true,
        cwd: './src/runtime',
        src: ['**/*.coffee'],
        dest: './dist',
        ext: '.js'
        options:
          bare: true

    copy:
      dist:
        expand: true,
        cwd: './src/runtime',
        src: ['minigap/lib/*.js']
        dest: './dist'

    watch:
      files: ["src/**/*.coffee"]
      tasks: ["build"]
  
    clean: ["bin/lib", "bin/tasks", "dist"]

  grunt.loadNpmTasks "grunt-contrib-coffee"
  grunt.loadNpmTasks "grunt-contrib-watch"
  grunt.loadNpmTasks 'grunt-contrib-copy'
  grunt.loadNpmTasks "grunt-contrib-clean"

  grunt.registerTask "build", ["clean", "coffee:dist", "coffee:cli", "copy:dist"]
  grunt.registerTask "default", ["build"]
