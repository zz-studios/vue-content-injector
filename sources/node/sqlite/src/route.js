import { warnSqlite } from './utils/warn'

export class Route {
	#db
	constructor(db, { path, name }, props) {
		this.#db = db
		this.path = path
		this.name = name
		if (props) {
			this.props = props
		}
	}



	children = () => new Promise(async (resolve, reject) => {
		const children = []
		const db = this.#db
		const getChildrenParams = { parentPath: this.path }
		db.each(
			'select path, name, parentPath from route where parentPath = $parentPath',
			getChildrenParams,
			(err, row) => {
				if (err) {
					reject(warnSqlite(err, 'Route getChildren error 0'))
					return
				}
				children.push(new Route(db, row))
			}, (err, count) => {
				if (err) {
					reject(warnSqlite(err, 'Route getChildren error 1'))
					return
				}
				// console.log('children', children)
				// console.log('children count "' + this.path + '":', count)
				resolve(children)
			},
		)
	})

	save() {
		const { path, props } = this
		var queries = Object.keys(props).map(routerView =>
			// TODO: check if we need to add or remove an entry, not just update if existing
			props[routerView].filter(prop => prop.value).map(prop =>
				"update prop set value = '" + prop.value + "' where path = '" + path + "' and routerView = '" + routerView + "' and name = '" + prop.name + "'"
			)
		)
		console.log('queries', queries)
		// db.exec("update prop set value = ? from prop where path = ? and routerView = ? and name = ?")
			// TODO: transactions
			// TODO: loop through components and save also
			// Q: what to do with parent stuff?
			updateProp.exec(queries.join(';'))
	}

	// props = () => new Promise(async (resolve, reject) => {
	// 	const props = {}
	// 	const db = this.#db
	// 	const getPropsParams = { path: this.path }

	// 	db.each(
	// 		'select path, routerView, name, value from prop where path = $path',
	// 		getPropsParams,
	// 		(err, row) => {
	// 			if (err) {
	// 				reject(warnSqlite(err, 'Route getProps error 0'))
	// 				return
	// 			}

	// 			const propRouterView = props[row.routerView] ? props[row.routerView] : props[row.routerView] = []

	// 			propRouterView.push(new Prop(db, row))
	// 		},
	// 		(err, count) => {
	// 			if (err) {
	// 				reject(warnSqlite(err, 'Route getProps error 1'))
	// 				return
	// 			}
	// 			// console.log('children', children)
	// 			// console.log('children count "' + this.path + '":', count)
	// 			resolve(props)
	// 		},
	// 	)
	// })


}
