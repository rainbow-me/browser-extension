/* eslint-disable @typescript-eslint/no-var-requires */
const webpack = require('webpack');
const CircularDependencyPlugin = require('circular-dependency-plugin')

const config = require('../webpack.config');
const DepShieldPlugin = require('../DepShield');


// Statically require packages that are loaded dynamically in webpack
// so we can generate LavaMoat policies for them.
require('css-loader');
require('loader-runner');
require('html-webpack-plugin');
require('file-loader');
require('ts-loader');
require('typescript');
const TerserPlugin = require('terser-webpack-plugin');

const MAX_CYCLES = 8;
let numCyclesDetected = 0;

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
    new CircularDependencyPlugin({
      // exclude detection of files based on a RegExp
      exclude: /node_modules/,
      // include specific files based on a RegExp
      include: /src/,
      onStart({ compilation }) {
        numCyclesDetected = 0;
      },
      onDetected({ module: webpackModuleRecord, paths, compilation }) {
        numCyclesDetected++;
        compilation.warnings.push(new Error(paths.join(' -> ')))
      },
      onEnd({ compilation }) {
        if (numCyclesDetected > MAX_CYCLES) {
          compilation.errors.push(new Error(
            `Detected ${numCyclesDetected} cycles which exceeds configured limit of ${MAX_CYCLES}`
          ));
        }
      },
      // allow import cycles that include an asyncronous import,
      // e.g. via import(/* webpackMode: "weak" */ './file.js')
      allowAsyncCycles: false,
      // set the current working directory for displaying module paths
      cwd: process.cwd(),
    }),
    new DepShieldPlugin({
      failOnError: true,
      cwd: process.cwd(),
    }),
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
  if(stats.hasErrors()) {
    process.exit(1);
  } else {
    process.exit(0);
  }
});
