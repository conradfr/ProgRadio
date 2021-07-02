const path = require('path')
var webpack = require('webpack');
// const VueLoaderPlugin = require('vue-loader/lib/plugin')
const { VueLoaderPlugin } = require('vue-loader');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

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
  mode: 'production',
  // target: ['web', 'es5'],
  target: 'web',
  entry: {
    app: [
      path.resolve(__dirname, '../public/vue/app.js'),
      // path.resolve(__dirname, '../public/less/main.less'),
      // path.resolve(__dirname, '../public/sass/main.scss')
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
      }
    ],
  },
  plugins: [
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
  resolve: {
    alias: {
      // 'vue$': 'vue/dist/vue.esm.js'
      vue: '@vue/compat'
    }
  },
  optimization: {
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
    nodeEnv: 'production',
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
