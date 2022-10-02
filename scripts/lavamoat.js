const browserify = require('browserify');
const globby = require('globby');
const fs = require('fs');
const path = require('path');

// Statically require packages that are loaded dynamically in browserify
// so we can generate LavaMoat policies for them.
require('lavamoat-browserify');
require('lavamoat-core');
require('lavamoat-tofu');

const isGeneratingPolicy = Boolean(process.env.GENERATE_POLICY);

(async () => {
  const paths = await globby(['build/*.js']);

  paths.forEach((path_) => {
    const name = path.parse(path_).name;
    if (['contentscript', 'provider'].includes(name)) return;
    const browserifyInstance = browserify(path_)
      .plugin('lavamoat-browserify', {
        policy: `./lavamoat/browserify/${name}/policy.json`,
        override: `./lavamoat/browserify/${name}/policy-override.json`,
        writeAutoPolicy: isGeneratingPolicy,
      })
      .bundle();
    if (!isGeneratingPolicy) {
      browserifyInstance
        .pipe(fs.createWriteStream(`${path_}.tmp`))
        .once('finish', () => {
          fs.unlinkSync(path_);
          fs.renameSync(`${path_}.tmp`, path_);
        });
    }
  });
})();
