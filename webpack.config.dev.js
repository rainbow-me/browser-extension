/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const { resolve } = require('path');

const ExtensionReloader = require('webpack-extension-reloader');

const manifest = require('./static/manifest.json');
const config = require('./webpack.config');

const basicPermissions = manifest.permissions;

// Any key we want to override for dev builds we can do it here
const manifestOverride = {
  ...manifest,
  permissions: basicPermissions.concat(['contextMenus']),
};

const manifestFilePath = resolve(__dirname, './build/manifest.json');

const manifestForBuild = require(manifestFilePath);
const allowedPlugins = [];

if (manifestForBuild.background.scripts) {
  console.log('building for firefox! disabling hot reload');
} else {
  allowedPlugins.push(
    new ExtensionReloader({
      manifest: manifestFilePath,
      reloadPage: true,
      entries: {
        background: 'background',
        contentScript: 'contentscript',
        extensionPage: 'popup',
      },
    }),
  );
}

module.exports = {
  ...config,
  mode: 'development',
  devtool: false,
  plugins: [
    ...config.plugins,
    ...allowedPlugins,
    {
      apply: (compiler) => {
        compiler.hooks.afterEmit.tap('AfterEmitPlugin', () => {
          if (
            fs.writeFileSync(
              manifestFilePath,
              JSON.stringify(manifestOverride, null, 2),
            )
          ) {
            process.stdout.write('manifest overwritten successfuly');
          } else {
            process.stderr.write('manifest override failed');
          }
        });
      },
    },
  ],
};
