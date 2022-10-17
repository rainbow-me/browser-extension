/* eslint-disable @typescript-eslint/no-var-requires */
const ExtensionReloader = require('webpack-extension-reloader');
const { resolve } = require('path');

const config = require('./webpack.config');
const { EnvironmentPlugin } = require('webpack');

module.exports = {
  ...config,
  mode: 'development',
  devtool: false,
  plugins: [
    ...config.plugins,
    new EnvironmentPlugin({
      PLAYGROUND: process.env.PLAYGROUND
        ? JSON.stringify(process.env.PLAYGROUND)
        : null,
    }),
    new ExtensionReloader({
      manifest: resolve(__dirname, './build/manifest.json'),
      reloadPage: true,
      entries: {
        background: 'background',
        contentScript: 'contentscript',
        extensionPage: 'popup',
      },
    }),
  ],
};
