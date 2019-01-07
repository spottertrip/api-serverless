const path = require('path');
const slsw = require('serverless-webpack');

module.exports = {
  target: 'node',  
  entry: slsw.lib.entries,
  resolve: {
    extensions: ['.ts', '.js', '.tsx', '.jsx', '.json'],
    modules: [ 'node_modules' ],
    alias: {
      '@repositories': path.resolve(__dirname, 'src/repositories'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@datastore': path.resolve(__dirname, 'src/datastore'),
      '@handlers': path.resolve(__dirname, 'src/handlers')
    }
  },
  output: {
    libraryTarget: 'commonjs',
    path: path.join(__dirname, '.webpack'),
    filename: '[name].js',
  },
  module: {
    rules: [
      { test: /\.ts(x?)$/, loader: 'ts-loader' },
    ],
  },
  
};