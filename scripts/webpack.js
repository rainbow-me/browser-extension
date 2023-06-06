/* eslint-disable @typescript-eslint/no-var-requires */
const webpack = require('webpack');

const config = require('../webpack.config');

// Statically require packages that are loaded dynamically in webpack
// so we can generate LavaMoat policies for them.
require('css-loader');
require('loader-runner');
require('html-webpack-plugin');
require('file-loader');
require('ts-loader');
require('typescript');
const TerserPlugin = require('terser-webpack-plugin');

webpack({ ...config, 
  optimization: {
    minimize: true,
    nodeEnv: 'production',
    sideEffects: true,
    splitChunks: {
      chunks: 'async'
    }
  }, 
  output: {
    ...config.output,
    clean: true,
  },
  devtool: 'source-map',
  mode: 'production',
  plugins: [
    ...config.plugins,
    new TerserPlugin({
      terserOptions: {
          format: {
              comments: false,
          },
      },
      extractComments: false,
      // enable parallel running
      parallel: true,
  }),
  ],
 }).run((err, stats) => {
  if (err) throw err;
  console.log(stats.toString());
  process.exit(0);
});
