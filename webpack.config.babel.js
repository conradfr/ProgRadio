'use strict';

var path = require('path');

module.exports = {
    entry: path.join(__dirname, '/web/vue/app.js'),
    output: {
        path: __dirname + '/web/build/js',
        filename: 'app.js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                query: {
                    presets: ['es2015', 'stage-0']
                }
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader'
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
