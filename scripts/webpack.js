const webpack = require('webpack');
const { join } = require('path');
const config = require('../webpack.config');

// Statically require packages that are loaded dynamically in webpack
// so we can generate LavaMoat policies for them.
require('loader-runner');
require('html-webpack-plugin');
require('ts-loader');
require('typescript');

webpack(config).run((err) => {
  if (err) throw err;
  console.log('done!');
  process.exit(0);
});
