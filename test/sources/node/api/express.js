// this test will create a content store that reads from an API using:
//  @zz-studios/content-source-api
// and it looks for the API hosted with anythign in the apis folder.
// note: the config for the API takes in the API paths for an API
// - but all of ours example will use the default configuration.


const ApiContent = require('@zz-studios/content-source-api').default

const apiContent = new ApiContent({ baseUrl: 'http://localhost:8090/content' })
// this fills the DB with initial content
// - you wouldn't always call it
// - but for testing using memory, yes
// const testcontent = require('../../../content')

apiContent.getRoute({ name: 'home' }).then(route => {
	console.log('getHome', route)
})
