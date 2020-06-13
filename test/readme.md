# /content-source-test

This project contains a number of test scripts for the example Content Sources for the vue-router-prop-injector project.

The convention is as follows, and follows the convention for the parent project as whole:

## Folder convention
### First level
The type of example project.

* api - this is an API that will host content to be read remotely
* sources - these are the different content sources can be stored/read

### Second level
The technology platform it's written in

* node - nodejs
* core - .NET Core

### Third level: apis

For the apis this is a sub technology used, for example, "express" for expressjs

### Forth level: apis

This is a js file that will test the API with a specific source. These are the same sources in the sources tests below.

### Third level: sources
For the sources, this is the name of the source type

* api
* object
* sqlite

### Third level: sources
For the sources, this is the name of the specific source

## Examples:
### /apis/node/express/sqlite.js
This will host an example express API using sqlite as the content source

### /sources/node/api/express
This will use the exmaple express API as a source.

## Notes

### How this works
Here is a breif rundown of the thought behinde the way that the whole "content-sources".

* The @zz-studios/vue-router-prop-injector project is used to inject content into a Vuejs app. This was created for use with the @zz-studios/vue-cms project, but can be used by any project that needs this functionality. This process is documented elsewhere but what's important here is that:
	* it does this by replacing the props within the loaded router with our own injector
	* it accepts a "content" object which can contain the following properties:
		* routes - gets all the root level routes
			* type: object, function or Promise
			* returns: a list of routes
		* getRoute - function to get aspecific route by path or name
			*	type: function or Promise,
			* accepts: an object with a name or path property
			* returns: a single route (with its props)
		* fill - fills the content source with content from an object
		* create - creates the content store for the first time
		* TODO: outline the save/update/createRoute, etc

* The goal of this project is to:
	* provide working content sources on many different technology stacks
	* allow those content sources to be both working examples and allow them bo be used "out-of-the-box"
		* if others wish to create the, great, I will link them in a list if you provide me your projects name or I can add them to this repository.

* There are currently two sets of projects:
	* sources - this contains the man content sources to pass into the vue-router-prop-injector
	* apis - this contains APIs written in many different technologies (nodejs, .NET core, etc)
	
The apis run outside of where the content vue-router-prop-injector runs and each take in a content source in and of themselves in the same format as vue-router-prop-injector does.

One of the most important content sources is the node/api content source. This content source will read FROM an API. In other words, you can host an API from a content source and then in your vue application you can read that API as your content source.

Examples:

You can host an API in express by doing and have it read its content from an sqlite database. Then you can have yoru vuejs app use the api content source to read from that API into your running application.

You could, of course, and the sqlite content source directly in your vuejs application, but that would be running on the client side, and would only be per-visitor to your site. This maybe what you want. For Vue-CMS it's not very useful, but if you were storing data for some kind of tool - you could create the sqlite database with the filepath of ':memory:' and then it would be per-session. Not sure how useful that is if you're already using vuejs, but who am I to judge.

So to sum up:

* Your vuejs app
* create content-source-api
* create vue-router-prop-injector with content: content-source-api
* create 














