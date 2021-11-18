export class InjectorConfig {
	constructor(Vue, { name, content, router, mode }) {
		this.name = name

		this.router = router ? router : Vue.prototype.$router

		if (!this.router) {
			throw new Error('Please either initialize a router first, or pass it to the configuration object.');
		}

		this.content = content

		if (!this.content) {
			throw new Error('Please pass a content object or function to the configuration object.');
		}

		this.mode = mode ? mode : 'cd'
	}
}
