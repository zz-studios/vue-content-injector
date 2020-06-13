import { PropInjector } from './prop.injector'

import { warn } from './utils/warn'

// this wraps the content route in promises and provides an inject method for all its routes
export class InjectorRoute {
	#_private
	constructor(contentRoute, parent) {
		this.#_private = {
			parent, // note: the parent is really only used to pass the stacks along...
		}

		this.injected = false

		this.contentRoute = contentRoute
		// this.props = wrapInPromise(contentRoute.props)
		// this.children = wrapInPromise(contentRoute.children)

	}

	get name() {
		return this.contentRoute.name
	}

	get path() {
		return this.contentRoute.path
	}


	inject(route) {
		return new Promise(async (resolve, reject) => {

			if (this.injected) {
				resolve(this) // we have already injected this route (it's all or nothing with the props, right?)
			}

			const components = route.component ? { default: route.component } : route.components
			if (!components) {
				warn('contentRoute is targeting a router-view that isn\'t set on this route.', this)
				resolve(this)
				return
			}

			// note: we loop through the props the component HAS
			// - we don't care what props some idjit may have put in the route
			for (const routeComponentView in components) { // for each of the components router views we have
				const routeComponent = components[routeComponentView]

				// TODO: this.props is a PROMISE? no - it does not need be right?
				// - we need to get it all off of contentRoute...

				// TODO: this is NOT propInjectorProps - it's content? wth was this doing?
				const contentProps = this.contentRoute.props[routeComponentView]

				if (!contentProps) continue // only touch what we need to

				const componentProps = routeComponent.props
				const routeProps = route.props[routeComponentView] ? route.props[routeComponentView] : route.props[routeComponentView] = {} // so it can always exists now

				for (const componentPropName in componentProps) { // we loop through the props that exist on the component
					const contentProp = contentProps[componentPropName]
					if (!contentProp) continue // only touch what we need to

					// either of these can be undefined. That's perfectly fine. 
					// note: our component value will fall back to routeProp falls back to componentProp.default
					// - but - the coninue above these comments will prevent that from even existing!
					const componentProp = componentProps[componentPropName]
					const routeProp = routeProps[componentPropName]


					// this will set it even if it didn't already exist, perfect!
					// note: the value returned here is a reference to the inner value of the propinjector
					const injector = new PropInjector([contentProp, routeProp, componentProp])

					// note: I used to pass two of the three values into the getValue method when there was a prop
					injector.getValue().then(value => routeProps[componentPropName] = value)
					
				}
			}

			this.injected = true // no need to do all this again (right?)

		})
	}
}
