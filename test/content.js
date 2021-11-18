// This file contains test content that will be used to source the many examples we have.

module.exports = {
	routes: [ // not an array, a key/value pair of full routes
		// TODO: what happens when a route has moved/changed - hmmmm.... name?
		{
			path: '',
			props: {
				default: { // this is on the MainView
					componentParentRouterNoneContentYes: 'C',
					componentParentRouterParentContentYes: 'C',
					componentParentRouterBothContentYes: 'C',
					componentDefaultRouterNoneContentYes: 'C',

				},
			},
			children: [
				{
					path: '/',
					name: 'home', // TODO: name OR path?
					props: {
						content: { // this is on the ContentChild
							componentChildRouterNoneContentYes: 'C',
							componentChildRouterChildContentYes: 'C',
							componentChildRouterBothContentYes: 'C',
						},
					}
				},
				{
					path: '/homechild1',
					props: {
						content: { // this is on the ContentChild
							componentChildRouterNoneContentYes: 'C',
							componentChildRouterChildContentYes: 'C',
							componentChildRouterBothContentYes: 'C',
						},
					},
					children: [
						{
							path: '/homechild1/',
							name: 'homechild1',
							props: {
								content: { // this is on the ContentChild
									componentChildRouterNoneContentYes: 'C',
									componentChildRouterChildContentYes: 'C',
									componentChildRouterBothContentYes: 'C',
								},
							}
						}

					]
				}
			]
		}, {
			path: '/test1/test2/test3',
			props: {}

		}, { // TODO: needed?
			path: 'cms',
			props: {}

		}

	]
}
