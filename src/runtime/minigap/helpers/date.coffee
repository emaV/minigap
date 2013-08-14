#= require "../lib/moment.js"

moment = @.moment

for str, loc of Minigap.locales
  if loc.moment?
    moment.lang(str, loc.moment)

Handlebars.registerHelper "date", (context, block) ->
  if moment
    lang = block.hash.lang
    f = block.hash.format or "D MMM YYYY"
    if lang?
      return moment(Date(context)).lang(lang).format(f)
    else
      return moment(Date(context)).lang(Minigap.getDefaultLocale()).format(f)
  else
    return context

