const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  target: 'node',
  externals: [nodeExternals()],

  devtool: 'cheap-module-source-map',
  entry: {
    'observable-api': path.join(__dirname, 'lib', 'browser', 'observable-api.js'),
    'axios-adapter': path.join(__dirname, 'lib', 'browser', 'axios-adapter.js'),
    'jquery-adapter': path.join(__dirname, 'lib', 'browser', 'jquery-adapter.js'),
  },
  output: {
    path: path.join(__dirname, 'lib', 'dist'),
    filename: '[name].js',
  },
  exclude: /(node_modules|bower_components)/,
  errorDetails: true,
  plugins: [],
  module: {
    loaders: [],
  }
};