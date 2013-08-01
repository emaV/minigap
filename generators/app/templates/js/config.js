module.exports = function(config) {
  /*
    Environments
  */

  config.env("*", {
    title: "MyApp"
  });
  config.env("dev", {
    origin: "localhost:3001",
    bind: "localhost:3000"
  });
  config.env("dist", {
    origin: "http://ds.example.org/",
    bind: "localhost:80"
  });
  /*
    Targets
  */

  config.target("server", {
    files: {
      "app/js/app.js": "server.js"
    },
    dest: {
      dev: "dev",
      dist: "dist"
    },
    run: "server.js"
  });
  return config.target("browser", {
    files: {
      "app/js/app.js": "js/app.js",
      "app/layout.html": "index.html"
    },
    dest: {
      dev: "dev/public",
      dist: "dist/public"
    }
  });
  /*
    Dependencies
  */

  /*
  config.dep "handlebars",
      base: 'dist'
      files: [ "handlebars.runtime.js" ]
  */

};
