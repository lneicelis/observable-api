const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  target: 'node',
  externals: [nodeExternals()],

  devtool: 'cheap-module-source-map',
  entry: {
    lib: path.join(__dirname, 'lib', 'browser', 'observable-api.js'),
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