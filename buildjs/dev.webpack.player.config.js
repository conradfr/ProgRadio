const path = require('path')
var webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'development',
  target: 'web',
  devtool: 'eval-cheap-module-source-map',
  entry: {
    mini_player: [
      path.resolve(__dirname, '../public/vue/mini_player.js'),
    ]
  },
  output: {
    path: path.resolve(__dirname, '../public/build/js'),
    filename: '[name].bundle.js',
  },
  module: {

  },
  plugins: [
    new webpack.DefinePlugin({
      __VUE_PROD_DEVTOOLS__: true,
      __VUE_OPTIONS_API__: true,
      'process.env': {
        NODE_ENV: '"development"'
      }
    }),
  ],
  resolve: {

  },
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
    minimize: false,
    nodeEnv: 'development',
    flagIncludedChunks: true,
    sideEffects: true,
    usedExports: true,
    concatenateModules: true,
    checkWasmTypes: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          format: {
            comments: false,
          },
        },
        extractComments: false,
      }),
    ],
  }
}
