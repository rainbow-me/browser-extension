/* eslint-disable @typescript-eslint/no-var-requires */
const webpack = require('webpack');
const fs = require('fs');
const { join, extname } = require('path');
const CircularDependencyPlugin = require('circular-dependency-plugin')

const config = require('../webpack.config');
const DepShieldPlugin = require('../DepShield');


// Statically require packages that are loaded dynamically in webpack
// so we can generate LavaMoat policies for them.
require('css-loader');
require('loader-runner');
require('html-webpack-plugin');
require('file-loader');
require('ts-loader');
require('typescript');

const TerserPlugin = require('terser-webpack-plugin');

/**
 * Synchronously replaces all occurrences of a substring in a file.
 *
 * @param {string} filePath - The path to the file.
 * @param {string} target - The substring to replace.
 * @param {string} replacement - The string to replace the target with.
 */
function replaceInFile(filePath, target, replacement) {
  // Read the file synchronously
  const fileContents = fs.readFileSync(filePath, 'utf8');
  
  // Replace all occurrences of the target substring
  const updatedContents = fileContents.split(target).join(replacement);
  
  // Write the updated contents back to the file
  fs.writeFileSync(filePath, updatedContents); 
}

const buildDir = join(__dirname, '../build');

const replacePopupCssName = () => {
  return new Promise((resolve) => {
    console.log('replacing popup.css instances');
      fs.readdir(buildDir, (err, files) => {
        const popupCssFile = files.find(file => {
          return extname(file) === '.css' &&
                file !== 'background.css' &&
                file !== 'inpage.css';
        });
        if (popupCssFile) {
          replaceInFile('build/background.js.map', 'popup.css', popupCssFile);
          replaceInFile('build/inpage.js.map', 'popup.css', popupCssFile);
          replaceInFile('build/inpage.js', 'popup.css', popupCssFile);
          replaceInFile('build/manifest.json', 'popup.css', popupCssFile);
          console.log('all instances replaced');
        } else {
          console.log('popup.css file not found. Skipping...');
        }
        resolve();
    });
  });
}


const MAX_CYCLES = 2;
let numCyclesDetected = 0;

const webpackConfig = { ...config, 
  entry: {
    background: './src/entries/background/index.ts',
    contentscript: './src/entries/content/index.ts',
    inpage: './src/entries/inpage/index.ts',
  },
  optimization: {
    minimize: true,
    nodeEnv: 'production',
    sideEffects: true,
    splitChunks: {
      chunks: 'async'
    }
  }, 
  output: {
    ...config.output,
    clean: true,
  },
  devtool: 'source-map',
  mode: 'production',
  plugins: [
    ...config.plugins,
    new CircularDependencyPlugin({
      // exclude detection of files based on a RegExp
      exclude: /node_modules/,
      // include specific files based on a RegExp
      include: /src/,
      onStart({ compilation }) {
        numCyclesDetected = 0;
      },
      onDetected({ module: webpackModuleRecord, paths, compilation }) {
        numCyclesDetected++;
        compilation.warnings.push(new Error(paths.join(' -> ')))
      },
      onEnd({ compilation }) {
        if (numCyclesDetected > MAX_CYCLES) {
          compilation.errors.push(new Error(
            `Detected ${numCyclesDetected} cycles which exceeds configured limit of ${MAX_CYCLES}`
          ));
        }
      },
      // allow import cycles that include an asynchronous import,
      // e.g. via import(/* webpackMode: "weak" */ './file.js')
      allowAsyncCycles: false,
      // set the current working directory for displaying module paths
      cwd: process.cwd(),
    }),
    new DepShieldPlugin({
      failOnError: true,
      cwd: process.cwd(),
    }),
    new TerserPlugin({
      terserOptions: {
          format: {
              comments: false,
          },
      },
      extractComments: false,
      // enable parallel running
      parallel: true,
  }),
  ],
 };

// Tweak the UI build to split chunks
const webpackConfigUI = { 
  ...webpackConfig,
  entry: {
    popup: './src/entries/popup/index.ts',
  },
  optimization: {
    ...webpackConfig.optimization,
    splitChunks: {
      chunks: 'all',
    }
  },
  output: {
    ...config.output,
    clean: false,
  },
};

// BUILD THE APP (BG + CONTENTSCRIPT + INPAGE)
webpack(webpackConfig).run((err, stats) => {
  if (err) throw err;
  console.log(stats.toString());
  if(stats.hasErrors()) {
    process.exit(1);
  } else {
      // BUILD THE UI (POPUP)
      webpack(webpackConfigUI).run(async (err, stats) => {
        if (err) throw err;
        console.log(stats.toString());
        if(stats.hasErrors()) {
          console.warn('build failed with errors');
          process.exit(1);
        } else {
          await replacePopupCssName();
          console.warn('build has passed without errors');
          process.exit(0);
        }
    });
}
});


