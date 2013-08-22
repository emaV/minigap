# API

## Minigap.Runtime 
_(or just `Minigap`)_

A `Runtime` implements Minigap API based on the execution context (eg. node, browser, phonegap ..). It provides low level facility to other components. Since it is a Singleton, once a runtime is created it replaces the Minigap namespace with itself, so when you call `Minigap.[something]` you are invoking a runtime method.

### Abstract interface

#### `Minigap.Runtime.prototype.start()`

Starts a Minigap application.

eg.

```
Minigap.start()
```

#### `Minigap.Runtime.prototype.controller(controller)`

Sets up a controller. A controller is an _event-callback_ map from which you can handle everything in your application. A typical controller may be like this:

```
Minigap.controller
  '/' ->
    @render('home')

  'click button': ->
    alert('you clicked a button')

  '@pubSub:/chat/message/': (e) ->
    alert("You received a message from #{e.from}: #{e.message}!")

```

#### `Minigap.Runtime.prototype.origin(origin)`
#### `Minigap.Runtime.prototype.mainFrame([selector])`
#### `Minigap.Runtime.prototype.defaultLocale([selector])`
#### `Minigap.Runtime.prototype.global(key, [value])`
#### `Minigap.Runtime.prototype.session(key, [value])`
#### `Minigap.Runtime.prototype.redirect(path, args, opts)`
#### `Minigap.Runtime.prototype.ajax(opts)`
#### `Minigap.Runtime.prototype.dom()`

## Origin

An Origin is an abstraction of a data source. Through Origins you can create service layers for your application.

#### `Minigap.Origin.prototype.request(path, args={}, options={}, callback)`

Perform a request to the origin and run callback when the response is ready passing returned data as argument.

```
Minigap.origin("ds", new JSendOrigin("http://localhost:3000"));

Minigap.controller({
	"/": function(){
		this.ds.request("/posts", function(data){
			this.render("home", data);
		});
	}
});

```

#### `Minigap.Origin.prototype.install(runtime)`
#### `Minigap.Origin.prototype.start(runtime)`

#### `Minigap.Origin.prototype.on(event)`
#### `Minigap.Origin.prototype.off(event)`
#### `Minigap.Origin.prototype.emit(event)`


