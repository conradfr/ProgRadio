const path = require('path');
const webpack = require('webpack');
const { VueLoaderPlugin } = require('vue-loader');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = {
  mode: 'development',
  target: 'web',
  devtool: 'eval-cheap-module-source-map',
  entry: {
    app: [
      './public/vue/app.ts'
    ],
    // light: path.resolve(__dirname, '../public/sass/main_light.scss'),
    // kept only ro regenerate colors in case of Bootstrap or theme update
    // we do not use the full theme for dark mode, only the generated css variables
    // dark: path.resolve(__dirname, '../public/sass/main_dark.scss'),
    theme: path.resolve(__dirname, '../public/sass/main_global.scss')
  },
  output: {
    path: path.resolve(__dirname, '../public/build/js'),
    filename: '[name].js',
  },
  resolve: {
    extensions: [ '.ts', '.js' ],
    alias: {
      '@': path.resolve(__dirname, '../public/vue'),
    },
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '../css/[name].css'
    }),
    new VueLoaderPlugin(),
    new ESLintPlugin({
      cache: true,
      extensions: ['js', 'vue', 'ts'],
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
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          preserveWhitespace: false,
          transformToRequire: {
            source: 'src'
          },
          exclude: /node_modules/,
        }
      },
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        options: {
          appendTsSuffixTo: [/\.vue$/]
        },
        exclude: /node_modules/,
      },
      { test: /\.js$/, loader: "source-map-loader" },
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
  optimization: {
    minimize: false,
    nodeEnv: 'development',
    flagIncludedChunks: true,
    sideEffects: true,
    usedExports: true,
    concatenateModules: true,
    checkWasmTypes: false,
  }
};
