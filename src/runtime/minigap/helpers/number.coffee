Handlebars.registerHelper "currency", (amount, options) ->
  amount = options.contexts[0].get(amount)  if typeof (amount) is "string"
  rounded = Math.round(amount * 100)
  dec = rounded % 100
  whole = rounded / 100 - dec / 100
  decStr = "" + dec
  "$" + whole + "." + decStr + ((if decStr.length < 2 then "0" else ""))