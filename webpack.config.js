// @ts-check

'use strict';

const path = require('path');

/** @type {import('webpack').Configuration} */
const config = {
  target: 'node',
  mode: 'none', // this leaves the source code as close as possible to the original (when packaging we set this to 'production')

  entry: './src/extension.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2'
  },
  devtool: 'nosources-source-map',
  externals: {
    vscode: 'commonjs vscode',

    // Copied from https://github.com/microsoft/powerplatform-vscode/pull/61/files#diff-1fb26bc12ac780c7ad7325730ed09fc4c2c3d757c276c3dacc44bfe20faf166fR28
    // To avoid a webpack warning from vscode-extension-telemetry.
    'applicationinsights-native-metrics': 'commonjs applicationinsights-native-metrics',
    '@opentelemetry/tracing': "commonjs @opentelemetry/tracing"
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
      },
      {
        test: /\.sh$/,
        exclude: /node_modules/,
        loader: 'raw-loader',
      }
    ]
  }
};
module.exports = config;
