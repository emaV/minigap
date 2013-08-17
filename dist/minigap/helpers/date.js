
//= require "../lib/moment.js"
;
var loc, moment, str, _ref;

moment = this.moment;

_ref = Minigap.locales;
for (str in _ref) {
  loc = _ref[str];
  if (loc.moment != null) {
    moment.lang(str, loc.moment);
  }
}

Handlebars.registerHelper("date", function(context, block) {
  var f, lang;
  if (moment) {
    lang = block.hash.lang;
    f = block.hash.format || "D MMM YYYY";
    if (lang != null) {
      return moment(Date(context)).lang(lang).format(f);
    } else {
      return moment(Date(context)).lang(Minigap.getDefaultLocale()).format(f);
    }
  } else {
    return context;
  }
});
