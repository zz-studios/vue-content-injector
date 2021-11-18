const { ApiBase } = require('../api.base')

// TODO: where here to I specify the cd vs cm?
// - what config is being passed?

export class SaveApi extends ApiBase {
	constructor(saveService) {
		super('content') // still on the content route
		this.saveService = saveService

		//this.sitePrefex = '/:siteName'
		// this.router.get('/', (req, res) => {
		//     this.contentService.getContent()
		//         .then(content => this.send(res, content))
		//         .catch(err => this.send(res, err))
		// })

		// examples:
		// /api/route
		// /api/route?path=/test
		// /api/route?name=test

		// TODO: save here!
		this.router.post(['/routes', '/route'], (req, res) => {
			console.log('apis/node/express/api/save.api: posting route')

			// TODO: this isn't ready yet?
			const path = req.query.path

			// note we ignore name, is this correct?
			const name = req.query.name

			console.log('path', path)
			// TODO: do something with this!
			const route = req.body

			if (path !== undefined) {
				this.saveService.saveRoute({ name, route })
					.then(route => this.send(res, route))
					.catch(err => this.send(res, err))
				// can't save without route?
				// } else {
				//     this.contentService.saveRoutes()
				//         .then(routes => this.send(res, routes))
				//         .catch(err => this.send(res, err))
			}
		})

		// we can supply the name as querystring or in the path
		// examples:
		// /api/route/home
		this.router.post(['/route/:name', '/routes/:name'], (req, res) => {
			// note we ignore name, is this correct?
			const name = req.params.name ? req.params.name : req.query.name
			const route = req.body

			this.saveService.saveRoute({ name, route })
				.then(route => this.send(res, route))
				.catch(err => {
					res.statusCode = err.statusCode ? err.statusCode : 500
					this.send(res, err)
				})
		})
	}
}


// this.insertRoute = 'insert into route(path, name, parentPath) VALUES ($path, $name, $parentPath)'
// this.insertProp = 'insert into prop(path, routerView, name, value) VALUES ($path, $routerView, $name, $value)'
// this.getRoutes = 'select path, name, parentPath from route where path = \'\' and parentPath is null'
// this.getRouteByName = 'select path, name, parentPath from route where name = $name'
// this.getRouteByPath = 'select path, name, parentPath from route where path = $path'
// this.getChildren = 'select path, name, parentPath from route where parentPath = $parentPath'
// this.getProps = 'select path, routerView, name, value from prop where path = $path'

