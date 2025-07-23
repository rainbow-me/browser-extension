/* eslint-disable @typescript-eslint/no-var-requires */
const { inc, valid } = require('semver');

const pkgJson = require('../package.json');
const manifest = require('../static/manifest.json');
const currentVersion = valid(pkgJson.version);
const newVersion = inc(currentVersion, 'patch');

console.log('bumping from v%s to v%s', currentVersion, newVersion);

pkgJson.version = newVersion;

// Update package.json
require('fs').writeFileSync(
  './package.json',
  JSON.stringify(pkgJson, null, 2) + '\n',
);
// Update manifest.json
manifest.version = newVersion;
require('fs').writeFileSync(
  './static/manifest.json',
  JSON.stringify(manifest, null, 2) + '\n',
);

console.log('Done.');
