module.exports = function(grunt) {

  grunt.initConfig({
    watch: {
      files: ["src/**/*.js", "src/**/*.coffee", "src/**/*.html"],
      tasks: ["build"]
    },
    handlebars: {
      compile: {
        options: {
          namespace: "JST"
        },
        files: {
          "www/js/templates.js": "minigap/**/*.html"
        }
      }
    }
  });
  grunt.registerTask("build", ["handlebars"]);
  return grunt.registerTask("default", "default", function() {
    // do nothing
  });

};
