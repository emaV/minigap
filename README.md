# MiniGap

__Minigap is a client-side javascript framework for PhoneGap__

## Disclaimer

__This project is yet in a very early stage of development and is not complete.__

__This README is used as a specification of what it will be, even if part of it have been implemented already there is no guarantee that the source of this package code reflects or will reflect it in any way.__

__This disclaimer will go away with the first alpha release.__

## Istallation

```
npm install -g minigap
```

## Setup a new application

```
minigap new myApp
cd myApp
npm install
```

This will create an initial application layout in `myApp` folder that you can use to further develop and install development dependencies.


## Directory Structure
```
myApp/
  src/
    css/
      app.css
      
  	js/
      lib/
        minigap.js
        handlebar.runtime.js (optional)
  	  app.coffee (or app.js)
  	
  	templates/
  
  	index.html

  package.json
  Gruntfile.coffee
```

## Building your app

Now that you are ready to create your application you would like to know how to build it. Minigap ships with a `Gruntfile` to perform basic tasks.

### Configuration

Minigap builds soruces compiling javascript/coffeescript, templates and html files passing your source through a compiler able to preprocess files.

Preprocessor is used to concatenate files and perform conditional compilation of code using macros in a way similar to `c/c++` preprocessor.  

### Preprocessing Macros

Preprocessing Macros are comments starting with `=`

eg.

Javascript

```
//= if development
...
//= end
```

Coffeescript

```
#= if development
…
#= end
```

HTML
(sorry for spacings my markdown editor goes crazy with html comments)

```
< !--= if development -- >
...
< !--= end -- >
```

### Preprocessing Directives

#### Inclusion

```
#= include <mylib.js>	
```

#### Direct Output

```
#= print VALUE
```

#### Conditional compilation

```
#= if CONDITION
...
#= else if CONDITION
...
#= else
...
#= end
```

##### Condition Operators

- ! _or_ not
- &amp; _or_ and
- || _or_ or
- &lt; _or_ lt
- &gt; _or_ gt
- &lt;= _or_ lte
- &gt;= _or_ gte
- == _or_ eq
- != _or_ neq

### Preprocessor environment

Minigap sets some preprocessor variables you can use as conditions.

When building for development the `development` variable is set to true. 

When building for production the `production` variable is set to true.

When building for a specific target the `target` variable is set to the target name.

So you can do things like this:

```
#= if development
   console.log "debug: #{myVar}"
#= end
```

or this:

```
< !--= if development -- >
	<script src="weinre_target_xyz.js"></script>
< !--= end -- >
```

or this:

```
#= if target == 'ios'
…
#= else if target == 'android'
...
#= end
```

### Managing Targets

Phonegap can target different devices and architectures. Minigap would hopefully simplify the task of building the same app for different targets.

In order to do so original Phonegap projects are mirrored inside the minigap project tree. These mirrors are used for building development packages. Any time you want to release your code you can create production bundles from command line.

Production bundles are deployed back to their original locations. 
 
Minigap targets are built through `grunt-contrib-minigap` tasks. So you may want to configure some in your `Gruntfile`.

#### Configuring targets
```
  grunt.initConfig
    # ..

    minigap:
      # ...
      targets:
		ios: '../myPhonegapIos'
		android: '../myPhonegapAndroid'
		# ...
```

Now that your targets is set up you should run the `mirror` task that create copies of targets inside the directory tree.

```
grunt mirror
```

This command would create a mirror of any target inside `yourApp/[target]` directories.

From now on you will use these directory for development. Any time you want to create production build, the application is copyied to its original target.


## Development

Minigap is designed to speed-up PhoneGap development process. A typical downside of phonegap development against regoular browsers is that you have to recompile and re-launch simulator any time you change something in your code. This task can be very annoying and slow.

To overcome this problem minigap ships with a mini-server that once started serves your assets. This way any change to the source is immediately reflected in your Phonegap runtime.

To start the server just lauch the grunt `start` task specifing the relative target.

```
grunt start [target]
```

This task will start the development server and watch for changes in your source so they are automatically rebuilt.

Also it will setup a WebSocket firing events on every rebuild. You can listen to it in order to refresh the page when code is updated.


### Preprocessing

```
grunt build ios
```

to get ready to deploy.

### Configuring build


## Handle everything with controllers

MiniGap adapt tipical components of a mobile application to let you handle them all the same way.

MiniGap applications are _event-driven_

```
Minigap.controller
  'app.start': ->
    console.log "Application Started"

  '/': ->

    @requests [
        path: '/top_events'
      ,
        path: '/top_events'
        params:
          section: 'sport'
      ,
        path: '/top_events'
        params:
         section: 'music'
    ], 

    (response) ->
     @render 'templates/home', response

```

## Default Events

### Application

- 'app.started'

### Router

- 'hashchange:scope' or just 'scope'
- 'submit:scope'
- 'before:scope'
- 'after:scope'

### Origin

- 'origin.[name].requestSent'
- 'origin.[name].responseReceived'

### Socket

- 'socket.[name].[evt]'

### TemplateEngine

- 'template.[name].rendered'

## Custom events

You can use `app.emit()` to send custom events

---

Copyright (c) 2013 mcasimir

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.