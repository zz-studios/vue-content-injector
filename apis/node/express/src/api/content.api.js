const { ApiBase } = require('../api.base')

export class ContentApi extends ApiBase {
    constructor(contentService) {
        super('content')
        this.contentService = contentService

        //this.sitePrefex = '/:siteName'
        this.router.get('/', (req, res) => {
            this.contentService.getContent()
                .then(content => this.send(res, content))
                .catch(err => this.send(res, err))
        })

        // examples:
        // /api/route
        // /api/route?path=/test
        // /api/route?name=test
        this.router.get(['/routes', '/route'], (req, res) => {
            const path = req.query.path
            const name = req.query.name

            console.log('path', path)
            if (path !== undefined) {
                this.contentService.getRoute({ path, name })
                    .then(route => this.send(res, route))
                    .catch(err => this.send(res, err))
            } else {
                this.contentService.getRoutes()
                    .then(routes => this.send(res, routes))
                    .catch(err => this.send(res, err))
            }
        })

        // we can supply the name as querystring or in the path
        // examples:
        // /api/route/home
        this.router.get(['/route/:name', '/routes/:name'], (req, res) => {
            const name = req.params.name ? req.params.name : req.query.name
            console.log('name', name)
            this.contentService.getRoute({ name })
                .then(route => this.send(res, route))
                .catch(err => this.send(res, err))
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

