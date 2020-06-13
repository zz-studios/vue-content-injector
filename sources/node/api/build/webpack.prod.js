'use strict'
const merge = require('webpack-merge')
const base = require('./webpack.common')

// so I'm creating variants in the common, then making them all dev here
module.exports = base.map(baseConfig => { // becasuse common returns a LIST of variants
    return merge(baseConfig, {
        mode: 'production',
    })
})



