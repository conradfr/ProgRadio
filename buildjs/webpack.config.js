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
      './public/vue/app.ts'
    ],
    light: path.resolve(__dirname, '../public/sass/main_light.scss'),
    dark: path.resolve(__dirname, '../public/sass/main_dark.scss'),
    global: path.resolve(__dirname, '../public/sass/main_global.scss')
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
        loader: 'ts-loader',
        options: {
          appendTsSuffixTo: [/\.vue$/]
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
        globalStyles: {
          name: 'main_global',
          test: (m, c, entry = 'global') =>
            m.constructor.name === 'CssModule' &&
            recursiveIssuer(m, c) === entry,
          chunks: 'all',
          enforce: true,
        },
      },
    },
    nodeEnv: 'production',
    flagIncludedChunks: true,
    sideEffects: true,
    usedExports: true,
    concatenateModules: true,
    checkWasmTypes: true,
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
