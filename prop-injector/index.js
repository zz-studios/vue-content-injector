// this simply exports our compiled code + our plain old js
const common = require('./dist/index.commonjs2.js')
const { base } = require('./js')

// TODO: find a way to make these "flat" by exlcuding stuff
module.exports.default = common

module.exports = {
	// the webpack built
	// the non-webpack built stuff
	//helpers,
	base
}

