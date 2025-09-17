/* eslint-disable @typescript-eslint/no-var-requires */
const manifestBase = require('../build/manifest.json');

const manifestFF = {
  ...manifestBase,
  background: {
    scripts: ['background.js'],
  },
  browser_specific_settings: {
    gecko: {
      id: 'browserextension@rainbow.me',
      strict_min_version: '116.0',
    },
  },
  host_permissions: [...manifestBase.host_permissions, '<all_urls>'],
};

require('fs').writeFileSync(
  './build/manifest.json',
  JSON.stringify(manifestFF, null, 2),
);
