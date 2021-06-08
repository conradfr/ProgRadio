const path = require('path')
var webpack = require('webpack');
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  mode: 'production',
  // target: ['web', 'es5'],
  target: 'web',
  entry: {
    app: [path.resolve(__dirname, '../public/vue/app.js'), path.resolve(__dirname, '../public/sass/main.scss')]
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
      }
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '../css/main.css'
    }),
    new VueLoaderPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
  ],
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    }
  },
  optimization: {
    minimize: true,
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
