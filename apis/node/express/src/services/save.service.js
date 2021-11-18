import { wrapInPromise } from '../utils'

// TODO: is "SaveService" the right name here?
// TODO: what if the right thing is to have one service, but don't expose the API?

export class SaveService {
  #_private = {}
  constructor(content) {
    this.content = content

		// TODO: hmm
    this.saveContent = wrapInPromise(content)
  }


  saveRoute = ({ route }) => new Promise(async (resolve, reject) => {
		// console.log('sources/node/api/content/save.service: saveRoute', { route })
    // TODO: get, patch, save! Just like ye olde Web API
		// TODO: which save to call, where's the loop, what to do?
    if (!this.#_private.saveRoute) {
        const content = await this.saveContent()
        this.#_private.saveRoute = wrapInPromise(content.saveRoute)
    }

    // note: we have to resolve/reject and not just return the promise, because we have code above it
		console.log('this.#_private.saveRoute', route.props);
    this.#_private.saveRoute({ route }).then(routes => resolve(routes)).catch(err => reject(err))
  })


}

