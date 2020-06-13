export class Prop {
	#dbContent
	constructor(dbContent, name, value) {
		this.#dbContent = dbContent
		this.name = name
		this.value = value
	}
}