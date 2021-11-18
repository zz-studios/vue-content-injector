import { ContentApi } from './api/content.api'
import { ContentService } from './services/content.service'

import { SaveApi } from './api/save.api'
import { SaveService } from './services/save.service'

const express = require('express')

const morgan = require('morgan')

const test  = []
const testfrank = [...test]

// TODO: pass root path and such?
// note: remember, the site would need to hoist this up
export class ApiServer {
	constructor({ content, port, host, mode }) { // it matters not where the content is from...
		let contentService = new ContentService(content)

		// TODO: do we want to move this to getApi methods or is that too much?
		let contentApi = new ContentApi(contentService)

		this.mode = mode ? mode : 'cd'
		this.port = port ? port : 8081
		this.host = host ? host : '0.0.0.0'

		this.apis = [
			contentApi,
      //saveApi if mode = 'cm'?
		]

		console.log('this.mode', this.mode)
		if(this.mode == 'cm') {
			let saveService = new SaveService(content)
			let saveApi = new SaveApi(saveService)
			this.apis.push(saveApi)
		}


		this.app = express() // you can NEST apps - because that's what we really wanted, right?
		this.app.use(express.urlencoded({ extended: false }))
		this.app.use(express.json())
		
		this.app.locals.title = 'Content Api App'

		if (process.env.NODE_ENV == 'development') {
			this.app.use(morgan('dev'))
		}


		let router = express.Router() // this router holds all APIs which in turn 


		this.apis.forEach(api => router.use(api.path, api.router))

		router.get('/', (req, res) => {
			res.type('json').send(JSON.stringify({ message: 'welcome to API' }))
		})

		// note: we look at /api here, but it's hoisted unto /cms and /cms/*/~vuecms/* later
		this.app.use('/', router)
	}

	listen() {

		//logDebugStackFromApp(this.app)

		this.server = this.app.listen(this.port, this.host, () => {
			let host = this.server.address().address
			let port = this.server.address().port

			console.log("Content API listening at http://%s:%s", host, port)
		}) // for now we return the app instance

		// TODO: Should this go somewhere else?


		return this.server
	}
}
