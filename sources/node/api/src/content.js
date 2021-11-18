import axios from 'axios'
import _ from 'lodash'

export class Content {
	#urlConfig = {
		baseUrl: '/api/content',
		getContent: '/',
		getRoutes: '/routes',
		getRouteByName: '/routes/:name',
		getRouteByPath: '/routes?path=:path',
	}

	constructor(urlConfig) {
		// { baseUrl, getContent, getRoutes, getRouteByName, getRouteByPath }
		_.merge(this.#urlConfig, urlConfig)
	}


	#get = (url) => axios.get(this.#urlConfig.baseUrl + url).then(res => res.data)
	#post = (url, data) => axios.post(this.#urlConfig.baseUrl + url, data).then(res => res.data)

	routes = () => this.#get(this.#urlConfig.getRoutes)
	getRoute = ({ name, path }) => {
		console.log('name, path?', name, path)
		return (name !== undefined
			? this.#get(this.#urlConfig.getRouteByName.replace(':name', name))
			: this.#get(this.#urlConfig.getRouteByPath.replace(':path', path))
		).then(ret => ret.err ? undefined : ret) // return undefined if the route wasn't found
	}
	// TODO: route is actually content, with the route itself nested - why?
	saveRoute = ({ route }) => {
		console.log('sources/node/api/content: saveRoute', { route })
		return (route.name !== undefined
			? this.#post(this.#urlConfig.getRouteByName.replace(':name', route.name), route)
			: this.#post(this.#urlConfig.getRouteByPath.replace(':path', route.path), route)
		).then(ret => ret.err ? undefined : ret) // return undefined if the route wasn't found
	}
}
