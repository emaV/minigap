# Minigap Roadmap

## CLI

- Handle handlebars templates to coffee with _`_
- Handle handlebars templates to js

- Clean before build
- Foreman-Like Runnable with web sockets logging `√`
- Watch with web socket `√`
- Watch should build before start `√`
- Speed up build process avoiding to recopy everithing each time (multiple watch?) `√`
- src/bases/TARGET is copied as is `√`
- Move preproc config extension from `Bundle` to `Config` `√`
- Drop `copy` in config ( make it private ) and use `bases` as default for `copy` `√`

## RUNTIME

- Split Runtimes in
	- View implementation
	- Ajax implementation
	- I18n

# Runtimes:

Runtime.prototype.start()
Runtime.prototype.controller(controller)
Runtime.prototype.origin(origin)

Runtime.prototype.mainFrame([selector])
Runtime.prototype.defaultLocale([selector])

Runtime.prototype.global(key, [value])
Runtime.prototype.session(key, [value])

Runtime.prototype.redirect(path, args, opts)

# Origin:

Origin.prototype.start(runtime)
Origin.prototype.install(runtime)

Origin.prototype.on()
Origin.prototype.once()
Origin.prototype.off()
Origin.prototype.emit()

Origin.prototype.send(path, args, opts, cb)

Origin Events
	"@ds:/PathToEvent"



- FayeOrigin
- Handle multiple rendering in same action
- Phonegap Runtime

## Generator

- Bare generator template
- Web template

```
APPNAME/
	src/
		app/
			js/
				app.coffee
			css/
				app.css
			templates/
			locales/
			app.html
		bases/
			server/
			browser/

	config.coffee
	.mingap
```