const sqlite3 = require('sqlite3').verbose()

import { Route } from './route'
import { warnSqlite } from './utils/warn'

export class Content {
	#db
	constructor({ filename, database }) {

		if (database) {
			this.#db = database
		} else if (filename) {
			this.#db = new sqlite3.Database(filename)
		} else {
			console.log('Error, you must supply Content with a fileame or ContentDatabase instance.')
		}

		this.initialized = false
	}


	getProps = ({ path }) => new Promise(async (resolve, reject) => {
		const db = this.#db
		const props = {}

		db.each(
			'select path, routerView, name, value from prop where path = $path',
			{ $path: path },
			(err, row) => {
				if (err) {
					reject(warnSqlite(err, 'getProps error 0'))
					return
				}

				const propRouterView = props[row.routerView] ? props[row.routerView] : props[row.routerView] = {}

				propRouterView[row.name] = row.value
			},
			(err, count) => {
				if (err) {
					reject(warnSqlite(err, 'getProps error 1'))
					return
				}
				resolve(props)
			},
		)
	})


	routes = () => new Promise(async (resolve, reject) => {
		const routes = []
		const db = this.#db
		//  where path = \'\' and parentPath is null
		db.each('select path, name, parentPath from route', (err, row) => {
			if (err) {
				warnSqlite(err, 'Content routes getRoutes error')
				return
			}
			// note: this is a list without props on purpose
			// const props = await this.getProps(row)
			routes.push(new Route(db, row))
		}, (err) => {
			if (err) {
				reject(warnSqlite(err, 'Content routes getRoutes error'))
				return
			}
			resolve(routes)
		})
	})



	getRoute = ({ name, path }) => new Promise(async (resolve, reject) => {
		const db = this.#db
		console.log('getRoute', name, path)

		// TODO: always return the props with the route
		// - but what of children?
		const routeQuery = `select path, name, parentPath
				from route 
				where ${(name !== undefined ? 'name = $name' : 'path = $path')}`

		const routeQueryParams = name !== undefined ? { $name: name } : { $path: path } //

		console.log('routeQuery', routeQuery)
		db.get(routeQuery, routeQueryParams, (err, row) => {
			if (err) {
				console.log('err', err)
				reject(warnSqlite(err, 'getRoute Error'))
				return
			}
			if (!row) {
				reject(warnSqlite({ message: 'route not found' }, 'getRoute Error', 404))
				return
			}

			this.getProps(row).then(props => {
				resolve(new Route(db, row, props))
			})
		})
	})


	create = () => new Promise((resolve, reject) => {
		const db = this.#db

		if (this.initialized) { // already initialized, so return the  db
			resolve(db)
			return
		}

		db.get('select name from sqlite_master where type=\'table\' and name=\'route\'', (err, row) => {
			if (err) {
				reject(warnSqlite(err, 'create Error'))
				return
			}
			if (row) { // if we have the route table, this db is created
				this.initialized = true
				resolve(db)
				return
			} else { // if no route table, create all tablees.
				db.exec(`
							create table route (path text primary key, name text, parentPath text);
							create table prop (path text, routerView text, name text, value text, 
								primary key(path, routerView, name), foreign key(path) references route(path));
						`,
					(err, row) => {
						if (err) {
							reject(warnSqlite(err, 'create tables error'))
						}
						this.initialized = true

						resolve(db)
						return
					}
				)//foreign key(parentPath) references route(path) ?
			}
		})

	})

	// TODO: SAVE CONTENT here
	// Q: do we need name and path if already have the route itself?
	saveRoute = ({ name, route }) => new Promise(async (resolve, reject) => {
		const db = this.#db

		console.log('sources/node/sqlite/content: saveRoute1')

		// Q: can we update the path etc?

		// TODO: Q: are we updating the route or the route's content here?
		// - also, we need to do it for each child right?
		// const saveRouteQuery = `update route set path = $path, name, parentPath
		// 		from route 
		// 		where ${(route.name !== undefined ? 'name = $name' : 'path = $path')}`

		// TODO: update all routes!
		// const saveRouteQuery = `update route set path = $path, name, parentPath
		// 		from route 
		// 		where ${(route.name !== undefined ? 'name = $name' : 'path = $path')}`

		// const routeQueryParams = { $name: route.name, $path: route.path }

		// TODO: save props
		// TODO: save component -> name -> props, etc


		// TODO: Save children? no
		// TODO: save props? yes
		// updateProp
		// - ah right: the code should be IN the route? right?
		// - the select code is, hmm? in children?
		// - no - just the children code was - and we're NOT saving chlidren here, just the current routes props!
		// so:
		// TODO: create the execs
		// - which means looping right?
		// - how do I know what was updated, or should I save it all no matter what? Yeah, why not!
		// console.log('saving?', saveRouteQuery)
		// TODO: get the route and save?
		this.getRoute(name != undefined ? { name } : route).then(tblRoute => { // yes, this fuction will unpack the path and name!

			console.log('tblRoute', tblRoute)
			// TODO: why is it props.content and not props.default?
			// - because tblRoute may not be the same route...!!!
			// - one is home and one is ''
			// - which one were we at?
			// TODO: now we need to update the tblRoute with the info from route!
			// - props and all!!!
			// repository pattern?
			// Q: what was the difference here between components and props and why do I have both?
			Object.keys(tblRoute.props).forEach(routerView => {
				console.log('routerView', routerView)
				// TODO: should I be looping through tblRoute.props, route.props or both?
				// TODO: need to do "add/create" - right now it will only update known props
				const routeProps = route.props[routerView]

				// TODO: undefined here - because different route, right? (/ vs. home?)
				tblRoute.props[routerView].props.forEach(tblProp => {
					// TODO: get the prop from route that matches
					const routeProp = routeProps.find(p => p.name == tblProp.name) // TODO: was this nested? 
					tblProp.value = routeProp.value // TODO: change only what changed?
				})
				// TODO: get the prop from route that matches
			})


			// // This isn't what we need - this is just what COMPONENT is in what routerView, not what Props there are
			// Object.keys(tblRoute.components).forEach(routerView => {
			// 	const component = route.components[routerView]
			// 	tblRoute.components[routerView].props.forEach(tblProp => {
			// 		// TODO: get the prop from route that matches
			// 		component.props.find() // TODO: was this nested? 
			// 	})
			// 	// TODO: get the prop from route that matches
			// 	route.props.find()
			// 	route.components.find()
			// })

			tblRoute.save()
			// db.exec(saveRouteQuery, routeQueryParams)
			// Q: Should we wrap this with "update component" methods?
			// - what did the DB structure look like again?
		}).catch(err => {
			console.log('err', err)
			reject(err)
		})
	})

	fill = (content) => new Promise(async (resolve, reject) => {
		const db = await this.create()
		const addRoute = (route, parentRoute) => {
			// note: we will just not look at the parent of route='' - that way we don't have to make the parentPath nullable for no reason
			const insertRouteParams = {
				$path: route.path,
				$name: route.name,
				$parentPath: parentRoute ? parentRoute.path : null
			}
			// TODO: actually this can move when we start with "saving" our content!
			db.run(
				'insert into route(path, name, parentPath) VALUES ($path, $name, $parentPath)',
				insertRouteParams,
				err => warnSqlite(err, 'insert route error'),
			)
			if (route.props) {
				for (let routerView in route.props) {
					for (let propName in route.props[routerView]) {
						const insertPropParams = {
							$path: route.path,
							$routerView: routerView,
							$name: propName,
							$value: route.props[routerView][propName],
						}

						db.run(
							'insert into prop(path, routerView, name, value) VALUES ($path, $routerView, $name, $value)',
							insertPropParams,
							err => warnSqlite(err, 'insert prop error'),

						)// note: we will just not look at the parent of route='' - that way we don't have to make the parentPath nullable for no reason
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

		resolve(this)
	})



}
