const webpack = require('webpack');
const { join } = require('path');

// Statically require packages that are loaded dynamically in webpack
// so we can generate LavaMoat policies for them.
require('loader-runner');
require('ts-loader');
require('typescript');

const isDev = process.argv[2] === 'dev';

webpack({
  mode: 'production',
  watch: true,
  entry: {
    background: './src/scripts/background.ts',
    contentscript: './src/scripts/contentscript.ts',
    popup: './src/scripts/popup.ts',
    provider: './src/scripts/provider.ts',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: '[name].js',
    path: join(__dirname, '..', 'build'),
  },
}).run((err) => {
  if (err) throw err;
  console.log('done!');
  process.exit(0);
});
