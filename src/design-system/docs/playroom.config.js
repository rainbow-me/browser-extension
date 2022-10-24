const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { VanillaExtractPlugin } = require('@vanilla-extract/webpack-plugin');
const path = require('path');
const webpack = require('webpack'); // eslint-disable-line import/no-extraneous-dependencies

module.exports = {
  baseUrl: '/playroom/',
  components: './.playroom/components.ts',
  exampleCode: ``,
  frameComponent: './.playroom/FrameComponent.js',
  iframeSandbox: 'allow-scripts',
  openBrowser: false,
  outputPath: './out/playroom',
  paramType: 'search',
  port: 9000,
  themes: './.playroom/themes.ts',
  title: 'RDS Playroom',
  webpackConfig: () => ({
    module: {
      rules: [
        {
          test: /\.(js|ts|tsx)$/,
          use: [
            {
              loader: require.resolve('babel-loader'),
              options: {
                configFile: path.resolve(
                  __dirname,
                  './node_modules/playroom/.babelrc',
                ),
              },
            },
          ],
        },
        {
          test: /\.woff2?$/,
          use: 'file-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.vanilla\.css$/i,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: require.resolve('css-loader'),
              options: {
                url: false,
              },
            },
          ],
        },
      ],
    },
    plugins: [
      new VanillaExtractPlugin(),
      new MiniCssExtractPlugin({ ignoreOrder: true }),
    ],
    resolve: {
      modules: [path.join(__dirname, './node_modules'), 'node_modules'],
    },
  }),
  widths: [360],
};
