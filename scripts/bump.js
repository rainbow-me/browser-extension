/* eslint-disable @typescript-eslint/no-var-requires */
const { inc, valid } = require('semver');

const pkgJson = require('../package.json');
const currentVersion = valid(pkgJson.version);
const newVersion = inc(currentVersion, 'patch');

console.log('bumping from v%s to v%s', currentVersion, newVersion);

pkgJson.version = newVersion;

// Update package.json
require('fs').writeFileSync('./package.json', JSON.stringify(pkgJson, null, 2));

console.log('Done.');
