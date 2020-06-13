import  { wrapInPromise } from './utils'

export class PropInjector { // really this is the PropInjectorPropInjector - because I'm starting all my classes with "PropInjector" and this is the "PropInjector"
	constructor(propMethods) { // contentProp is already an instance of PropInjectorProp
		this.value = '' // note: this has to have a value right away to let vuejs observer observe it

		if (propMethods) {
			this.propMethods = propMethods ? propMethods.map(propMethod => wrapInPromise(propMethod)) : []
		}
	}

	async getValue() {
		let value = ''
		for (let i = 0; i < this.propMethods.length; i++) {
			if ((value = await this.propMethods[i]()) != undefined) {
				break
			}
		}
		return this.value = value
	}
}