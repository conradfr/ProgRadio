const path = require('path')
var webpack = require('webpack');
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = {
  mode: 'development',
  target: ['web', 'es2015'],
  devtool: 'eval-cheap-module-source-map',
  entry: {
    app: [path.resolve(__dirname, '../public/vue/app.js'), path.resolve(__dirname, '../public/less/main.less')]
  },
  output: {
    path: path.resolve(__dirname, '../public/build/js'),
    filename: '[name].bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          preserveWhitespace: false,
          transformToRequire: {
            source: 'src'
          }
        }
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
/*      {
        test: /\.(ttf|otf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?|(jpg|gif)$/,
        use: ['file-loader']
      },*/
      {
        test: /\.less$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader', // translates CSS into CommonJS
            options: {
              url: false
            }
          },
          {
            loader: 'less-loader', // compiles Less to CSS
            options: {
              lessOptions: {
                relativeUrls: false,
              },
            }
          },
        ],
      }
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '../css/main.css'
    }),
    new VueLoaderPlugin(),
    new ESLintPlugin({
      cache: true,
      extensions: ['js', 'vue',],
      context: 'public/vue',
      files: '/'
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"development"'
      }
    }),
  ],
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    }
  },
  optimization: {
    minimize: false,
    removeAvailableModules: false,
    removeEmptyChunks: false,
    splitChunks: false
  }
}
