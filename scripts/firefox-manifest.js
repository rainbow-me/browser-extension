const manifestBase = require('../build/manifest.json');
const allowList = require('../static/allowlist.json');

const manifestFF = {
    ...manifestBase,
    background: {
      "scripts": ["background.js"]
    },
    browser_specific_settings: {
      "gecko": {
        "id": "bx@rainbow.me",
        "strict_min_version": "115.0"
      },
    },
    "content_security_policy": {
      "extension_pages": "frame-ancestors 'none'; script-src 'self'; object-src 'self';"
    },
    "host_permissions": [
      "<all_urls>",
    ],
};

require('fs').writeFileSync(
  './build/manifest.json',
  JSON.stringify(manifestFF, null, 2),
);