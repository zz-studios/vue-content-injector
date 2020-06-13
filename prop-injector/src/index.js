import OurVue from './utils/vue'
import { warn } from './utils/warn'

import { PropInjector } from './prop.injector'
import { ContentInjector } from './content.injector'

import { InjectorRoute } from './route'

import { InjectorConfig } from './config'

const NAME = 'VueRouterPropInjector'
const PROP_NAME = '$vueRouterPropInjector'

const checkMultipleVue = (() => {
	let checkMultipleVueWarned = false

	const MULTIPLE_VUE_WARNING = [
		'Multiple instances of Vue detected!',
		'You may need to set up an alias for Vue in your bundler config.'
	].join('\n')
	return Vue => {
		/* istanbul ignore next */
		if (!checkMultipleVueWarned && OurVue !== Vue && !isJSDOM) {
			warn(MULTIPLE_VUE_WARNING)
		}
		checkMultipleVueWarned = true
	}
})()

const getPrototype = (Vue = OurVue) => Vue.prototype[PROP_NAME] = OurVue.prototype[PROP_NAME] = Vue.prototype[PROP_NAME] || OurVue.prototype[PROP_NAME] || {}

const setConfig = (config, Vue = OurVue) => {
	if (config) {
		getPrototype(Vue).config = new InjectorConfig(Vue, config)
	}
}

export const getConfig = (Vue) => Vue.prototype[PROP_NAME].config

const setContentInjector = (Vue) => {
	const config = getConfig(Vue)
	getPrototype(Vue).content = new ContentInjector(config.content)
}

export const getContent = (Vue) => Vue.prototype[PROP_NAME].content


export const getRouter = (Vue) => {
	const config = getConfig(Vue)
	const router = (config && config.router) ? config.router : Vue.prototype.$router

	if (!router) {
		throw new Error('Please either initialize a router first, or pass it to the configuration object.');
	}

	return router
}

const registerWaits = (Vue, waits) => {
	if (!waits || waits.length == 0 || !Vue) return

	if (!waits || waits.length == 0) return
	const router = getRouter(Vue)

	
	const config = getConfig(Vue)

	waits.forEach(wait => {
		router.beforeEach(async (to, from, next) => {
			if (!wait.ifNot({ Vue, router, to, from, next })) {
				await wait.waitFor({ Vue, router, to, from, next })
			}
			next()

		})
	})
}

const waitForContentInjectionRoute = { // another attempte
	ifNot: () => false, // we check and get out in the waitFor because it's more complex and we don't want to do it twice!
	waitFor: ({ Vue, to }) => {
		// this will inject our content into all the matched routes
		getContent(Vue).inject(to)

	}
}


const waits = [waitForContentInjectionRoute]

const install = (Vue, config) => {
	install.installed = true
	checkMultipleVue(Vue)

	setConfig(config, Vue)
	setContentInjector(Vue)
	registerWaits(Vue, waits)
}

// note: we are exporting both VueRouterPropInjector AND install because in the future we may have individual features we want to be able to intall separately if need be.
const VueRouterPropInjector = {
	install,
	NAME
}

export {
	install,
	NAME,
	ContentInjector,
	PropInjector,
	InjectorRoute,
}

export default VueRouterPropInjector