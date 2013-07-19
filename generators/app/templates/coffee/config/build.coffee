module.exports = (builder) ->
  builder.config
    env: 
      assetsServer: "localhost:3300/devSocket"
      devSocket: "localhost:3301/devSocket"

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
            "\`#{content}\`"
          html: (content) ->
            "<script>\\\\<![CDATA[\n#{content}\n\\\\]]></script>"

      html:
        delimiters: ["<!--=", "-->"]
        extensions: ['.html']
    
    files: [
      "js/app.coffee", 
      "index.html"
    ]
