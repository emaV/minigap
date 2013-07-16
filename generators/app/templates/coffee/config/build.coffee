module.exports = (config) ->
  config.builder
    
    env: 
      devSocket: "localhost:3300/devSocket"
      assetsServer: "localhost:3300/devSocket"

    libs: [ "#{config.root}/lib" ]

    types:
      coffeescript:
        delimiters: ["#="]
        extensions: ['.coffee']

        to: 
          javascript: (content) ->
            coffee = require 'coffee-script'
            coffee.compile(content)

      javascript:
        delimiters: ["//="]
        extensions: ['.js']

        to: 
          javascript: (content) ->
            ";#{content};"
          coffeescript: (content) ->
            "\#{content}\"
          html: (content) ->
            "<script>\\\\<![CDATA[\n#{content}\n\\\\]]></script>"

      html:
        delimiters: ["<!--=", "-->"]
        extensions: ['.html']

  config.build("www/js/app.coffee", "www/js/app.coffee")
