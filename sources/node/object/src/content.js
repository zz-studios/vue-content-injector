import { Route } from './route'
import { ContentDatabase } from './content.database'

export class Content {
	#dbContent
	constructor({ filename, contentDatabase, sqlite3Database }) {
		if (contentDatabase) {
			this.#dbContent = contentDatabase
		} else if (sqlite3Database) {
			this.#dbContent = new ContentDatabase({ sqlite3Database })
		} else if (filename) {
			this.#dbContent = new ContentDatabase({ filename })
		} else {
			console.log('Error, you must supply Content with a fileame or ContentDatabase instance.')
		}
		// const config = {
		// 	methods: {
		// 		getContent: this.getContent,
		// 		getRoute: this.getRoute,
		// 	}
		// }

		// this.propInjectorContent = new PropInjectorContent(config)

	}

	routes() {
		return new Promise(async (resolve, reject) => {
			const routes = []
			const dbContent = await this.#dbContent.init()
			dbContent.getRoutes.each((err, row) => {
				if (err) {
					reject({ message: 'Content routes getRoutes error:', err })
					return
				}
				routes.push(new Route(dbContent, row.path, row.name))
			}, (err) => {
				if (err) {
					console.log('Content routes Error:', err)
					return
				}
				resolve(routes)
			})
		})
	}


	getRoute({ name, path }) {
		return new Promise(async (resolve, reject) => {
			const dbContent = await this.#dbContent.init()
			dbContent.getRoute.run(name, path, (err, row) => {
				if (err) {
					console.log('err2', err)
					reject({ message: 'getRoute Error', err })
					return
				}


				// TODO: resolve this as a new route of the injector kind!
				// TODO: do we even need the parent path?
				resolve(row)

			})
		})

	}

	// TODO: do the real saveRoute work here!
	// TODO: is this saveRoute or really saveProps?
	// - can we update props?
	saveRoute({ name, path, content }) { // TODO: aren't I saving myself? No - 
		return new Promise(async (resolve, reject) => {
			const dbContent = await this.#dbContent.init()
			dbContent.saveRoute.run(name, path, content, (err, row) => {

				// TODO: foreach is wrong here - or rather they should all be running in a transaction of some sort...
				dbContent.serialize(() => {
					content.routes.forEach(route => {
						route.props.forEach(prop => {
							// TODO: don't update if same?
							// - .each is for each result, but I want to run it for each prop!
							dbContent.updateProp.run(prop.value, route.path, route.routerView, route.nam, (err, row) => {
								if (err) {
									reject({ message: 'updateProp Error', err })
									return
								}
							})
						})
					})
				})
				resolve(row)
			})
		})

	}


	fill(content) {
		return new Promise(async (resolve, reject) => {
			const dbContent = await this.#dbContent.init()

			const addRoute = (route, parentRoute) => {

				dbContent.insertRoute.run(route.path, route.name, parentRoute ? parentRoute.path : null) // note: we will just not look at the parent of route='' - that way we don't have to make the parentPath nullable for no reason
				if (route.props) {
					for (let routerView in route.props) {
						for (let propName in route.props[routerView]) {
							dbContent.insertProp.run(route.path, routerView, propName, route.props[routerView][propName])// note: we will just not look at the parent of route='' - that way we don't have to make the parentPath nullable for no reason
						}
					}
				}

				if (route.children) {
					route.children.forEach(childRoute => addRoute(childRoute, route))
				}
			}


			content.routes.forEach(route => {
				addRoute(route)
			})

			// this.dbContent.db.each('select path, name, parentPath from route', (err, row) => {
			// 	if (err) {
			// 		reject({ message: 'Route init getChildren error:', err })
			// 		return
			// 	}
			// 	console.log('row', row)
			// })

			resolve(this)
		})
	}


}
