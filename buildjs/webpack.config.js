const path = require('path');
const webpack = require('webpack');
// const VueLoaderPlugin = require('vue-loader/lib/plugin')
const { VueLoaderPlugin } = require('vue-loader');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  mode: 'production',
  // target: ['web', 'es5'],
  target: 'web',
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
    chunkFormat: false
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      '@': path.resolve(__dirname, '../public/vue'),
    },
  },
  plugins: [
    // new BundleAnalyzerPlugin(),
    new MiniCssExtractPlugin({
      filename: '../css/[name].css'
    }),
    new VueLoaderPlugin(),
    new webpack.DefinePlugin({
      __VUE_PROD_DEVTOOLS__: false,
      __VUE_OPTIONS_API__: true,
      'process.env': {
        NODE_ENV: '"production"'
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
        loader: 'babel-loader',
        options: {
          // appendTsSuffixTo: [/\.vue$/],
          presets: [
            '@babel/preset-env',
            'babel-preset-typescript-vue3',
            [
              '@babel/preset-typescript',
              {
                // Allextensions: true, // supports all file extensions
              },
            ]
          ]
        },
        exclude: /node_modules/,
      },
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
  optimization: {
    nodeEnv: 'production',
    flagIncludedChunks: true,
    sideEffects: true,
    usedExports: true,
    concatenateModules: true,
    mergeDuplicateChunks: true,
    checkWasmTypes: true,
    removeAvailableModules: true,
    removeEmptyChunks: true,
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
};
