const webpack = require('webpack');
const { join } = require('path');
const config = require('../webpack.config');

// Statically require packages that are loaded dynamically in webpack
// so we can generate LavaMoat policies for them.
require('loader-runner');
require('html-webpack-plugin');
require('ts-loader');
require('typescript');
require('terser-webpack-plugin');

webpack(config).run((err, stats) => {
  if (err) throw err;
  console.log(stats.toString());
  process.exit(0);
});
