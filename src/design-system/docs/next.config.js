const { createVanillaExtractPlugin } = require('@vanilla-extract/next-plugin');
const path = require('path');
const withVanillaExtract = createVanillaExtractPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    externalDir: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  outputFileTracing: false,
  reactStrictMode: true,
  swcMinify: true,
  webpack(config) {
    config.resolve.fallback = { fs: false, module: false };
    config.module.rules.push({
      test: /\.woff2?$/,
      use: [
        {
          loader: 'file-loader',
          options: {
            outputPath: '../public',
            publicPath: '/'
          },
        },
      ],
      exclude: /node_modules/,
    });
    return config;
  },
};

const config = withVanillaExtract(nextConfig);

module.exports = config;
