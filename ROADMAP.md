# Minigap Roadmap

## CLI

- Clean before build
- Foreman-Like Runnable with web sockets logging
- Watch with web socket
- Watch should build before start `√`
- Speed up build process avoiding to recopy everithing each time (multiple watch?)
- src/bases/TARGET is copied as is
- Handle handlebars templates to coffee with _`_
- Handle handlebars templates to js
- Move preproc config extension from `Bundle` to `Config`
- Drop `copy` in config ( make it private ) and use `bases` as default for `copy`

## RUNTIME

- Split Runtimes in
	- View implementation
	- Ajax implementation
	- Router implementation
	- I18n

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