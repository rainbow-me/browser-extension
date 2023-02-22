/* eslint-disable @typescript-eslint/no-var-requires */
const { merge } = require('lodash');
const { valid } = require('semver');

const manifestBase = require('../manifest/base.json');
const manifestInternal = require('../manifest/internal.json');
const manifestProd = require('../manifest/prod.json');
const pkgJson = require('../package.json');

const tracks = {
  internal: manifestInternal,
  prod: manifestProd,
};

const track = process.argv[2];
if (!Object.keys(tracks).includes(track)) {
  console.error('invalid track: %s', track);
  process.exit();
}

console.log('generating %s manifest.json', track);

const currentVersion = valid(pkgJson.version);
console.log('applying v%s version to manifest.json', currentVersion);
manifestBase.version = currentVersion;

console.log('applying %s.json to manifest base.json', track);
const manifest = merge(tracks[track], manifestBase);

// Sort manifest.json keys
function orderedStringify(obj, space) {
  const allKeys = new Set();
  JSON.stringify(obj, (key, value) => (allKeys.add(key), value));
  return JSON.stringify(obj, Array.from(allKeys).sort(), space);
}

// Update build/manifest.json
require('fs').writeFileSync(
  './build/manifest.json',
  orderedStringify(manifest, 2),
);

console.log('Done.');
