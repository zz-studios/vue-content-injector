import { Prop } from './prop'

export class Route {
	#dbContent
	constructor(dbContent, path, name) {
		this.#dbContent = dbContent
		this.path = path
		this.name = name
	}

	children() {
		return new Promise(async (resolve, reject) => {
			const children = []
			const dbContent = await this.#dbContent.init()

			dbContent.getChildren.each(this.path, (err, row) => {
				if (err) {
					reject({ message: 'Route getChildren error 0:', err })
					return
				}
				children.push(new Route(dbContent, row.path, row.name))
			}, (err, count) => {
				if (err) {
					reject({ message: 'Route getChildren error 1:', err })
					return
				}
				// console.log('children', children)
				// console.log('children count "' + this.path + '":', count)
				resolve(children)
			})
		})

	}

	props() {
		return new Promise(async (resolve, reject) => {
			const props = {}
			const dbContent = await this.#dbContent.init()

			dbContent.getProps.each(this.path, (err, row) => {
				if (err) {
					reject({ message: 'Route getProps error 0:', err })
					return
				}

				const propRouterView = props[row.routerView] ? props[row.routerView] : props[row.routerView] = []

				propRouterView.push(new Prop(dbContent, row.name, row.value))
			}, (err, count) => {
				if (err) {
					reject({ message: 'Route getProps error 1:', err })
					return
				}
				// console.log('children', children)
				// console.log('children count "' + this.path + '":', count)
				resolve(props)
			})
		})

	}

}
