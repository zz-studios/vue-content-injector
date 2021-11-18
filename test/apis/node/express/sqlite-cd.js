// this test will host an API with:
//  @zz-studios/content-source-node-express-api
// using:
//  @zz-studios/vue-content-source-node-sqlite

const ApiServer = require('@zz-studios/content-source-node-express-api').default

const SqliteContent = require('@zz-studios/vue-content-source-node-sqlite').default

const sqliteContent = new SqliteContent({ filename: ':memory:' })
// this fills the DB with initial content
// - you wouldn't always call it
// - but for testing using memory, yes
const testcontent = require('../../../content')

sqliteContent.fill(testcontent).then(async (content) => { // note: content = sqliteContent 
	const apiServer = new ApiServer({ content, port: 8090, mode: 'cd' })

	// TODO: in a real app you can choose to do:
	// const app = new express()
	// app.use(apiServer.app)
	// app.listen(...)
	apiServer.listen()

}).catch(err => console.log('fillContent Failed:', err))
