const sqlite3 = require('sqlite3').verbose()

export class ContentDatabase {
	constructor({ filename, sqlite3Database }) {
		this.initialized = false

		this.db = sqlite3Database
			? sqlite3Database
			: new sqlite3.Database(filename)

	}

	init() {
		const db = this.db
		return new Promise((resolve, reject) => {
			if (this.initialized) {
				resolve(this)
				return
			}

			db.serialize(() => {
				db.run("create table route (path text primary key, name text, parentPath text)", err => err ? console.log('create route table error:', err) : '') //foreign key(parentPath) references route(path) ?
				db.run("create table prop (path text, routerView text, name text, value text, primary key(path, routerView, name), foreign key(path) references route(path))", err => err ? console.log('create prop table error:', err) : '') //foreign key(parentPath) references route(path) ?


				this.insertRoute = db.prepare("insert into route(path, name, parentPath) VALUES (?, ?, ?)")
				this.insertProp = db.prepare("insert into prop(path, routerView, name, value) VALUES (?, ?, ?, ?)")
				this.getRoutes = db.prepare("select path, name, parentPath from route where path = '' and parentPath is null")
				this.getRoute = db.prepare("select path, name, parentPath from route where name = ? or path = ?")
				this.getChildren = db.prepare("select path, name, parentPath from route where parentPath = ?")
				this.getProps = db.prepare("select path, routerView, name, value from prop where path = ?")

				this.initialized = true
				resolve(this)


			})

		})
	}

}
