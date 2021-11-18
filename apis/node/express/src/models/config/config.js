// there are many ways to make this

export class Config {
	constructor({ content, port, host, https, mode }) {

// TODO: content can be:
// - a file
// - a URL
// - JSON
// - an object
// TODO: how to tell the difference?
// - easiest just to pass type, no?
		// this.store = store
		// this.router = router
    this.mode = mode ? mode : 'cd' // can be cm or cd
		this.content = content
		this.port = port ? port : '0'
		this.host = host ? host : '0.0.0.0'
		this.https = https ? https : false

	}
}