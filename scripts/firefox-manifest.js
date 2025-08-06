const manifestBase = require('../build/manifest.json');
const allowList = require('../static/allowlist.json');

const manifestFF = {
    ...manifestBase,
    background: {
      "scripts": ["background.js"]
    },
    browser_specific_settings: {
      "gecko": {
        "id": "browserextension@rainbow.me",
        "strict_min_version": "116.0"
      },
      "gecko_android": {
        "id": "browserextension@rainbow.me",
        "strict_max_version": "0"
      },
    },
    host_permissions: [
      ...manifestBase.host_permissions,
      "<all_urls>",
    ]
};

require('fs').writeFileSync(
  './build/manifest.json',
  JSON.stringify(manifestFF, null, 2),
);
