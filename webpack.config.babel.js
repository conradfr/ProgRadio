'use strict';

var webpack = require('webpack');
var path = require('path');

module.exports = {
    entry: path.join(__dirname, '/public/vue/app.js'),
    output: {
        path: __dirname + '/public/build/js',
        filename: 'app.js'
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': '"development"'
        })
    ],
    module: {
        rules: [
/*            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                query: {
                    presets: ['es2015', 'stage-0']
                }
            },*/
            {
              enforce: 'pre',
              test: /\.(js|vue)$/,
              loader: 'eslint-loader',
              exclude: /node_modules/
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    loaders: {
                        js: [
                            // { loader: 'cache-loader' },
                            { loader: 'babel-loader', options: { presets: ['env', 'stage-0'] } }
                        ]
                    }
                }
            }
        ]
    },
    resolve: {
        alias: {
            'vue$': 'vue/dist/vue.esm.js'
        }
    },
    devtool: 'source-map'
};
