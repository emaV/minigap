# MiniGap

__Minigap is a client-side javascript framework for PhoneGap__

## Disclaimer

This project is yet in a very early stage of development and is not complete. This disclaimer will go away with the first alpha release.

## Istallation

```
npm install -g minigap
```

## Setup a new application

```
cd myPhonegapApp
minigap init
npm install
```

This will copy the minigap distribution to your project root, install dependencies and create an initial application layout that you can use to further develop.

## Building your app

Now that you are ready to create your application you would like to know how to build what you will do. Minigap ships with a Gruntfile to perform basic tasks. Just type

```
grunt build
```

to get ready to deploy.

The whole bundle is packaged to `www/js/app.js` so include this file in your `index.html` to get ready to go. 

```
 <script type="text/javascript" src="js/app.js"></script>
```

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