module.exports = function(config) {
  config.builder({
    env: {
      devSocket: "localhost:3300/devSocket",
      assetsServer: "localhost:3300/devSocket"
    },
    libs: ["" + config.root + "/lib"],
    types: {
      coffeescript: {
        delimiters: ["//="],
        extensions: ['.coffee'],
        to: {
          javascript: function(content) {
            var coffee;
            coffee = require('coffee-script');
            return coffee.compile(content);
          }
        }
      },
      javascript: {
        delimiters: ["//="],
        extensions: ['.js'],
        to: {
          javascript: function(content) {
            return ";" + content + ";";
          },
          coffeescript: function(content) {
            return "\`" + content + "\`";
          },
          html: function(content) {
            return "<script>\\\\<![CDATA[\n" + content + "\n\\\\]]></script>";
          }
        }
      },
      html: {
        delimiters: ["<!--=", "-->"],
        extensions: ['.html']
      }
    }
  });
  return config.build("www/js/app.js", "www/js/app.js");
};
