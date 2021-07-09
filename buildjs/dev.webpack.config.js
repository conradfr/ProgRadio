const path = require('path')
var webpack = require('webpack');
// const VueLoaderPlugin = require('vue-loader/lib/plugin')
const { VueLoaderPlugin } = require('vue-loader');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
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
    app: [
      path.resolve(__dirname, '../public/vue/app.js'),
    ],
    light: path.resolve(__dirname, '../public/sass/main_light.scss'),
    dark: path.resolve(__dirname, '../public/sass/main_dark.scss')
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
          compilerOptions: {
            compatConfig: {
              MODE: 3
            }
          },
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
      filename: '../css/[name].css'
    }),
    new VueLoaderPlugin(),
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
      // 'vue-i18n': 'vue-i18n/dist/vue-i18n.runtime.esm-bundler.js',
      // 'vue$': 'vue/dist/vue.esm-bundler.js',
      vue: '@vue/compat'
      // vue: 'vue/dist/vue.esm-bundler.js'
    }
  },
  optimization: {
    minimize: false,
    removeAvailableModules: false,
    removeEmptyChunks: false,
    splitChunks: {
      // chunks: 'all',
      cacheGroups: {
        lightStyles: {
          name: 'main_light',
          test: (m, c, entry = 'light') =>
            m.constructor.name === 'CssModule' &&
            recursiveIssuer(m, c) === entry,
          chunks: 'all',
          enforce: true,
        },
        darkStyles: {
          name: 'main_dark',
          test: (m, c, entry = 'dark') =>
            m.constructor.name === 'CssModule' &&
            recursiveIssuer(m, c) === entry,
          chunks: 'all',
          enforce: true,
        },
      },
    },
  },
}
