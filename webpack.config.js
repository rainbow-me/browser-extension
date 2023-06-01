/** THIS IS THE PRODUCTION WEBPACK CONFIG FILE  **/

/* eslint-disable @typescript-eslint/no-var-requires */
const { sentryWebpackPlugin } = require('@sentry/webpack-plugin');
const BundleAnalyzerPlugin =
  require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const config = require('./webpack.config.base');

const additionalPlugins = [];
if (process.env.ANALYZE_BUNDLE === 'true') {
  additionalPlugins.push(
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      generateStatsFile: true,
      openAnalyzer: false,
    }),
  );
}

if (process.env.SENTRY_AUTH_TOKEN) {
  sentryWebpackPlugin({
    org: 'rainbow-me',
    project: 'rainbow-browser-extension',
    authToken: process.env.SENTRY_AUTH_TOKEN,
    env: process.env.SENTRY_ENVIRONMENT,
    finalize: true,
    version: process.env.SENTRY_RELEASE_VERSION,
  });
}

module.exports = {
  ...config,
  devtool: 'source-map',
  plugins: [...config.plugins, ...additionalPlugins],
};
