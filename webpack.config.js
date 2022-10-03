const HtmlWebpackPlugin = require('html-webpack-plugin');
const { join } = require('path');

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
  ],
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: '[name].js',
    path: join(__dirname, 'build/bundle'),
  },
};
