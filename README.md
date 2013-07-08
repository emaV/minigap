# MiniGap

__Minigap is a client-side javascript framework for PhoneGap__

MiniGap is designed to let you create PhoneGap applications fast.

- Create PhoneGap application fast
- DRY approach
- Hide PhoneGap specific stuffs
- View and Controllers
- Reactivity
- Handle HTTP requests, framework events, routes and web sockets all the same way
- Extendible
- Backend Agnostic
- Bulletprof Workflow

## Istall

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


## A tipical PhoneGap application



## One controller to rule them all

MiniGap adapt tipical components of a mobile application to let you handle them all the same way.

MiniGap applications are _event-driven_


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