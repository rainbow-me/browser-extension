const ExtensionReloader = require('webpack-extension-reloader');
const { resolve } = require('path');

const config = require('./webpack.config');

module.exports = {
  ...config,
  mode: 'development',
  devtool: false,
  plugins: [
    ...config.plugins,
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
