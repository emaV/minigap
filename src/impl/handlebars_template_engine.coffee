# require impl/libs/handlebars.runtime

class Minigap.HandlebarsTemplateEngine extends Minigap.TemplateEngine
  applyTemplate: (template, context, cb) ->
    cb.call @app, JST[template](context)

Minigap.DefaultTemplateEngine = Minigap.HandlebarsTemplateEngine