Handlebars.registerHelper("currency", function(amount, options) {
  var dec, decStr, rounded, whole;
  if (typeof amount === "string") {
    amount = options.contexts[0].get(amount);
  }
  rounded = Math.round(amount * 100);
  dec = rounded % 100;
  whole = rounded / 100 - dec / 100;
  decStr = "" + dec;
  return "$" + whole + "." + decStr + (decStr.length < 2 ? "0" : "");
});
