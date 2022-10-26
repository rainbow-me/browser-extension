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
require('terser-webpack-plugin');

webpack({ ...config, mode: 'production' }).run((err, stats) => {
  if (err) throw err;
  console.log(stats.toString());
  process.exit(0);
});
