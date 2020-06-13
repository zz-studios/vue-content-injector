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


		// TODO: always return the props with the route
		// - but what of children?
		const routeQuery = `select path, name, parentPath
				from route 
				where ${(name !== undefined ? 'name = $name' : 'path = $path')}`

		const routeQueryParams = { $name: name, $path: path } //


		db.get(routeQuery, routeQueryParams, (err, row) => {
			if (err) {
				reject(warnSqlite(err, 'getRoute Error'))
				return
			}
			if (!row) {
				reject(warnSqlite({ message: 'route not found'}, 'getRoute Error'))
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
