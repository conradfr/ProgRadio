const path = require('path')
var webpack = require('webpack');
const ESLintPlugin = require('eslint-webpack-plugin');

function recursiveIssuer(m, c) {
  const issuer = c.moduleGraph.getIssuer(m);

  if (issuer) {
    return recursiveIssuer(issuer, c);
  }

  const chunks = c.chunkGraph.getModuleChunks(m);

  for (const chunk of chunks) {
    return chunk.name;
  }

  return false;
}

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
    new ESLintPlugin({
      cache: true,
      extensions: ['js', 'vue',],
      context: 'public/vue',
      files: '/'
    }),
    new webpack.DefinePlugin({
      __VUE_PROD_DEVTOOLS__: true,
      __VUE_OPTIONS_API__: true,
      'process.env': {
        NODE_ENV: '"development"'
      }
    }),
  ],
  resolve: {
    alias: {

    }
  },
  optimization: {
    minimize: false,
    removeAvailableModules: false,
    removeEmptyChunks: false,
    splitChunks: {
      chunks: 'all'
    },
  },
}
