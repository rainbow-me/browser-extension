const HtmlWebpackPlugin = require('html-webpack-plugin');
const { join } = require('path');
const { ProgressPlugin } = require('webpack');

module.exports = {
  mode: 'production',
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
  plugins: [
    new HtmlWebpackPlugin({
      chunks: ['popup'],
      template: './src/popup.html',
      filename: 'popup.html',
    }),
    new ProgressPlugin(),
  ],
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    clean: true,
    filename: '[name].js',
    path: join(__dirname, 'build'),
  },
};
