const path = require('path')
var webpack = require('webpack');
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = {
  mode: 'development',
  target: 'web',
  devtool: 'eval-cheap-module-source-map',
  entry: {
    app: [
      path.resolve(__dirname, '../public/vue/app.js'),
      // path.resolve(__dirname, '../public/less/main.less'),
      path.resolve(__dirname, '../public/sass/main.scss')
    ]
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
        test: /\.s[ac]ss$/i,
        use: [
          // "style-loader",
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader', // translates CSS into CommonJS
            options: {
              url: false
            }
          },
          // Creates `style` nodes from JS strings
          // Translates CSS into CommonJS
          // "css-loader",
          // Compiles Sass to CSS
          {
            // Run postcss actions
            loader: 'postcss-loader'
          }, {
            // compiles Sass to CSS
            loader: 'sass-loader'
          }
        ],
      },
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
