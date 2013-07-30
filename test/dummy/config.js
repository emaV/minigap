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

  config.target("*", {
    files: {
      "js/app.js": "js/app.js",
      "index.html": "index.html"
    }
  });

  config.target("browser", {
    files: {
      "test/dummy/**/*.html": ["views/", "js"]
    },
    dest: {
      dev: "targets/browser/dev",
      dist: "targets/browser/dist"
    },
    run: "server.js"
  });

  config.target("server", {
    dest: {
      dev: "targets/server/dev",
      dist: "targets/server/dist"
    },
    run: "server.js"
  });

  /*
    Dependencies
  */

    config.dep("jquery", {
      v: "2.0",
      base: 'dist',
      files: ["jquery.js"]
    });
};
