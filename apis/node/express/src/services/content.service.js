import { wrapInPromise } from '../utils'

export class ContentService {
    #_private = {}
    constructor(content) {
        this.content = content
        this.getContent = wrapInPromise(content)
    }


    getRoute = ({ name, path }) => new Promise(async (resolve, reject) => {
        if (!this.#_private.getRoute) {
            const content = await this.getContent()
            this.#_private.getRoute = content.getRoute ? wrapInPromise(content.getRoute) : this.findContentRoute // TODO: possibly put this this.findContentRoute method in another library?
        }

        // note: we have to resolve/reject and not just return the promise, because we have code above it
        this.#_private.getRoute({ name, path }).then(routes => resolve(routes)).catch(err => reject(err))
    })


    getRoutes = () => new Promise(async (resolve, reject) => {
        if (!this.#_private.getRoutes) {
            const content = await this.getContent()
            this.#_private.getRoutes = wrapInPromise(content.routes)
        }

        // note: we have to resolve/reject and not just return the promise, because we have code above it
        this.#_private.getRoutes().then(routes => resolve(routes)).catch(err => reject(err))
    })
}

