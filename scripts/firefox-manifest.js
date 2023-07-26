const manifestBase = require('../build/manifest.json');

const manifestFF = {
    ...manifestBase,
    background: {
      "scripts": ["background.js"]
    },
    browser_specific_settings: {
    "gecko": {
      "id": "bx@rainbow.me",
      "strict_min_version": "115.0"
    }
  }
};

require('fs').writeFileSync(
  './build/manifest.json',
  JSON.stringify(manifestFF, null, 2),
);