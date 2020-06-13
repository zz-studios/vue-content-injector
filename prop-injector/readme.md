# About
## Vue Router Prop Injector

Injects content into props


NOTE: I have not published this to npm yet!
(working on it)

# Install

		npm i @zz-studios/vue-router-prop-injector

# Usage

## VueRouterPropInjector

	import Router from 'vue-router'

	import VueRouterPropInjector from 'vue-router-prop-injector'

	const router = new Router({
		mode: 'history',
		routes: [{
				path: '/',
				components: {
					default: MainView,
				},
				// props: { mainProp: 'RouterValue' }
		}]
	})

	const content = {
		routes: [{
			path: '/',
			props: { mainProp: 'ContentValue' }
		}]
	}

	Vue.use(VueRouterPropInjector, { content, router })

# Configuration Parameters

## Content
The structure for the content follows closely with the vue-router structure.

Note: for the continuation of this document, we will leave out the the first two levels of the content object and the routes property for the sake of brevity, vertical real estate, and general sanity:

		const content = { routes: [/* we will only show this */] }



Please note the following diferences:

* Named vs. unnamed router-views
While vue-router supports both named and unnamed router-views, our structure does not. That doesn't mean we will not inject content into those routes, just that the structure of the content doesn't support it. 
If you only have the unnamed router-view, it will go under the default router-view name.

For example, if your route has:

	const content = {
		path: '/',
		name: 'home',
		component: MainView,
		props: { mainProp: 'Value' }
	}

Our format will still be:

	{
		name: 'home',
		path: '/',
		props: {
			default: {
				mainProp: 'Value' 
			}
		}
	},



* The path property here is the full path. This is because our content matches the router's matched array, not your router's configuration routes. Also note that in that matched array, empty sub routes( a child with a path of "") used in the the Vue Routers's nested routes to set the components and props of a route show up with an extra '/'.

If your router defnition had:

	{
		path: '/',
		children: [
			{
				name: 'home',
				path: '',
				{
					path: 'homechild1',
					children: [
						{
							name: 'homechild1',
							path: '',
						},
					],
				},
			}
		]
	}
					

your content would be at:

	{
		path: '',
		children: [
			{
				name: 'home',
				path: '/',
				{
					path: '/homechild1',
					children: [
						{
							name: 'homechild1',
							path: '/homechild1/',
							props: {
								default: {
									mainProp: 'content',
								}
							}
						},
					],
				},
			}
		]
	}

* just like in Vue Router, the child nesting is optional since they are irrelevant due to the name and path being the full path. The only reason you may want to use nested routing is for ease of storage and presentation. This even includes the empty sub routes (denoted with an extra '/')

Using the previous example:

	{
		path: '',
	},
	{
		name: 'home',
		path: '/',
	},
	{
		path: '/homechild1',
	},
	{
		name: 'homechild1',
		path: '/homechild1/',
		props: {
			default: {
				mainProp: 'content',
			}
		}
	},

Of course, at this point, any content route without prop values is irrelevant, so we can simplify our content object:

	{
		name: 'homechild1',
		path: '/homechild1/',
		props: {
			default: {
				mainProp: 'content',
			}
		}
	},

	
Side note: I could have considered not using name at all, since the route is unique enough, but I wanted to support the posibility that a route would move in a site's tree, but still keep its name. Which when you think about it, is the reason named routes exist in the first place.


## More details examples

	{
		name: 'home',
		props: {
			default: {
				mainProp: 'Content',
			},
		},
	}

### With child routes

	{
		props: {
			default: {
				mainProp: 'Content',
			},
		},
		children: [{ // note that with child routs, the first child is path = '' and contains the name instead of the '/' parent
			name: 'home',
			props: {
				default: {
					mainProp: 'Content',
				},
			},
		},{
			name: 'firstChild',
			props: {
				default: {
					mainProp: 'Content',
				},
			},
		}]
	}

# Other useful Objects 

## PropInjectorContent
Used internally to help get the right content as-needed.

Has one function: getContentRoutes. This takes a route name and/or fullPath and returns an array of the matched routes. This is similar to what's in 'to.matched' when routing.

	import { PropInjectorContent } from 'vue-router-prop-injector'

	const content = new PropInjectorContent(content)

	content.getContentRoutes({ name: 'home' })


This object is also available at runtime via:
	
	this.$vueRouterPropInjector.content

### Constructor Parameters
* content - the content object or function where your content comes from

### Properties
* routes - the routes array from the content source
* inject - takes a list of routes from a routes "to.matched" and will inject the appropriate content into them

### Functions
* getContentRoute - will get the content for a route by its name or fullPath (name if both are supplied)

## PropInjector
Used to inject a prop with a value. You can set a prop to it and it will inject it.

### Constructor Parameters
* contentProp - a string or function that will return a props value 
*	routerProp - the prop from the router
* componentProp - the prop from the component, used here for its possible default value

All constructor parameters can be undefined and all will work just fine

### Properties
value - this accessor will return the value for the prop and will fallback from contentProp -> routerProp -> componentProp

### Use
This is used internally, but won't actually be assigned if the contentProp was blank and will fallback to the routers prop value if there is no value passed.

	import { PropInjector } from './prop.injector'
	import Router from 'vue-router'

	const propInjectorWithValue = new PropInjector('test1')
	const propInjectorWithRouterValue = new PropInjector('test2', 'test2') // obviously we ARE supplying a value!
	const propInjectorWithFunctions = new PropInjector(() => 'test1', () => 'test2')

	const router = new Router({
		mode: 'history',
		routes: [{
				path: '/',
				components: {
					default: MainView,
				},
				props: { 
					propWithValue: propInjectorWithValue.value,
					propWithFallbackValue: propInjectorWithFallbackValue.value,
					propWithFunctions: propInjectorWithFunctions.value,
				}
		}]
	})


# How it works

The Vue Router Prop Injector works is fairly simple. It adds or replaces props in your Vue Router that match the route name, router view name and prop name that you specify in your content object.

So if you have a component named "MainView" and it has a prop named 'title':

	export default {
		name: 'MainView',
		props: {
			title: String,
		}
	}

And you have a route that uses that component:

	const router = new Router({
		mode: 'history',
		routes: [{
			path: '/',
			name: 'home',
			components: {
				default: MainView
			},
			props: { },
		}]
	})

And you have your content object in a similar structure:

	const content =	{
		name: 'home',
		path: '/',
		props: {
			default: {
				title: 'My Title'
			}
		},
	}

You can use it as follows:

	import VueRouterPropInjector from 'vue-router-prop-injector'
	Vue.use(VueRouterPropInjector, { content, router })

And it will go through and assign every prop that matches with the props in the content object.

It does this for the list of matched routes in the parameter during the router's beforeEach event. This means that it will not attempt to modify the router (Vue.prototype.$router) until the route has been accessed. When it does, it will modify or add that prop to the list of props in the router with the injector. 

# Content Matching

The content route is retreived by either name or path using the following method:
* for each route and children of those routes
	* if the matched route has a name
		* if the name matches return that content route
		* if not, continue
	* if the matched route has no name
		* if the path patches return that content route
		* if not, continue

Once we have the content route, all of that routes prop values are replaced (or added if they exist in the component but not the route) by our Prop Injectors value accessor which will return the content's value, but fallback to the router's value and then to the components default value (even though the router's value may do that anyway).


# Why
OK, now you may be asking yourself why do I need to do this? Why wouldn't I just put the prop values right in my router. The answer is easy - since the content object can be injected at run time, you can source your content object from ANYWHERE.

It can come from the:
* database
* a vuex store - just set it to a getter or state object!

# History
I created this project while creating the VueCMS project because we needed just that. The ability to inject our editable content into the Vue application. But once I wrote the code for it inside of the VueCMS project, I realized it could be spun off into its own solo project.




