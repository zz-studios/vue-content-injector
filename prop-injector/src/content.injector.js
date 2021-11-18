import { InjectorRoute } from './route'

import { wrapInPromise } from './utils'

export class ContentInjector {
	#_private = {}
	constructor(config) {
		this.config = config
		this.getContent = wrapInPromise(config.content)
	}

	getRoute = ({ name, path }) => new Promise(async (resolve, reject) => {
		if (!this.#_private.getRoute) {
			const content = await this.getContent()
			this.#_private.getRoute = content.getRoute ? wrapInPromise(content.getRoute) : this.findContentRoute // TODO: possibly put this this.findContentRoute method in another library?
		}

		this.#_private.getRoute({ name, path }).then(routes => resolve(routes))
	})


	getRoutes = () => new Promise(async (resolve, reject) => {
		if (!this.#_private.getRoutes) {
			const content = await this.getContent()
			this.#_private.getRoutes = wrapInPromise(content.routes)
		}

		this.#_private.getRoutes.then(routes => {
			resolve(routes.map(contentRoute => new InjectorRoute(contentRoute, this)))
		})
	})

	// TODO: optional saveRoute? 
	// Q: does it belong here?
	// Q: can it go in another class?
	// - for now, put here and refactor later - need to get this working!

	// TODO: is the third parameter actually content? Or is it something else, like props, etc...
	// TODO: this is NEVER called? Why? Oh, not on the route, on the injector!?
	// TODO: figure out the missing piece in the chain!
	saveRoute = ({ route }) => new Promise(async (resolve, reject) => {
		// exit this if we're not in the 'cm' mode
		if (this.config.mode != 'cm') reject('Can only save in a mode of \'cm\'')

		//Q: this saveRoute is on the content as a whole? right?
		if (!this.#_private.saveRoute) {
			const content = await this.getContent()
			// TODO: this.findContentRoute for this? What is the equivalent?
			// TODO: we have to, because it's going to findContentRoute - but then what?
			// - issue is that "content" doesn't have a saveRoute?
			this.#_private.saveRoute = wrapInPromise(content.saveRoute) // TODO: possibly put this this.findContentRoute method in another library?
		}



		console.log('prop-injector/content.injector: calling saveRoute')
		this.#_private.saveRoute({ route }).then(route => resolve(route))
	})

	inject(route) { // the to.matched!
		return new Promise(async (resolve, reject) => {
			// const content = await this.getContent()

			// if our content object has a getRoute function, use it, otherwise use ours
			// note: this way - we can lazy-load if possible (e.g. only return one route from a DB!)
			const routes = route.matched ? route.matched : [route]
			routes.forEach(async (route) => {
				const contentRoute = await this.getRoute(route) // if we don't have it, all the getRoute to return it!
				if (!contentRoute) return // no route or error

				// TODO: InjectorRoute can be in a stack, right?
				const injectorRoute = new InjectorRoute(contentRoute, this)
				await injectorRoute.inject(route)
			})

			resolve()
		})
	}



	// this searches for a route in our content by name or path (note: in matches and our content path IS the fullPath)
	// it is only used if the user didn't provide a "getRoute" method - in those cases we traverse their routes array.
	// TODO: perhaps this goes inside the "object" source type and we wrap it with that?
	findContentRoute({ name, path }) {
		return new Promise(async (resolve, reject) => {
			// note: this is not available the first time through since the child routes are lazy-loaded
			// - this is because we don't want to load ALL routes on every page
			// - note: it's highly recommened to user something like vuex-persist to hold this injector so it'll stay between page loads!

			const findContentRouteRecursive = (contentRoutes) => {
				for (let i = 0; i < contentRoutes.length; i++) {
					const contentRoute = contentRoutes[i]
					if (name != undefined && contentRoute.name == name) { // we found it by name - that's unique, so we found it!
						return contentRoute
					} else if (contentRoute.path == path) { // we found it by path (here path is fullPath) - that's unique, so we found it!
						return contentRoute
					} else if (contentRoute.children && contentRoute.children.length > 0) { // nothing found yet, search children
						const foundChild = findContentRouteRecursive(contentRoute.children)
						if (foundChild) {
							return foundChild
						}
					}
				}
				return null // we didn't find anything at all
			}
			console.log('this.getRoutes', this.getRoutes)
			this.getRoutes().then(routes => resolve(findContentRouteRecursive(routes)))
		})
	}

}