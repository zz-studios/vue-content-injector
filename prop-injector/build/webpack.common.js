'use strict'
const path = require('path')
const nodeExternals = require('webpack-node-externals')
const EsmWebpackPlugin = require("@purtuga/esm-webpack-plugin")
const createVariants = require('parallel-webpack').createVariants
const pascalCase = require('pascal-case').pascalCase

const libraryName = pascalCase(require(path.resolve('./package.json')).name)

const createConfig = ({ target }) => {
    var config = {
        target: 'node',
        externals: [
            nodeExternals(),
            // for now I'm externalizing all requires containing vue-cms!
            ///\/package\.json/,
            ///commonjs.*/
        ], // this excludes node_modules!
        // watch: true,
        // mode: 'development',
        devtool: 'source-map', //cheap-module-
        //entry: glob.sync('./src/**'),
        entry: './src/index.js',
        output: {
            path: process.cwd() + '/dist',
            filename: 'index.' + target + '.js',
            library: libraryName,
            libraryTarget: target, // umd?
            umdNamedDefine: true,
        },
        module: {
            rules: [{
                test: /\.js$/,
                //exclude: /commonjs.*/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            ['@babel/preset-env', {
                                'targets': {
                                    'node': 'current'
                                }
                            }]
                        ],
                        plugins: ['@babel/plugin-proposal-class-properties']
                    }
                }
            },
            {
                use: 'eslint-loader',
                include: path.resolve(__dirname), // <-- This tell to eslint to look only in your project folder
                exclude: /node_modules/
            }]
        },
        resolve: {
            alias: {
                Models: path.resolve(__dirname, 'src/models/')
            },
            // root: path.resolve('./src'),
            extensions: ['.js'],
            // alias: {
            //     vue: 'vue/dist/vue.js'
            // },
        },
        node: {
            fs: "empty"
        },
        plugins: [
					'@babel/plugin-transform-typescript'
            //new EsmWebpackPlugin()
            //new VueLoaderPlugin(),
            // new CopyPlugin([
            //     { from: 'src/manifest.json' },
            //     { from: 'src/vendor', to: 'vendor' },
            // ]),
        ]
    }

    if (target == 'var') {
        config.plugins.push(new EsmWebpackPlugin())
    }
    return config
}



module.exports = createVariants({
    target: ['var', 'commonjs2', 'amd', 'umd'],
}, createConfig)


