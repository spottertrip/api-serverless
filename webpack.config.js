const path = require('path');
const slsw = require('serverless-webpack');

module.exports = {
  target: 'node',
  entry: slsw.lib.entries,
  resolve: {
    extensions: ['.ts', '.js', '.tsx', '.jsx', '.json'],
    modules: [ 'node_modules' ],
    alias: {
      '@datastore': path.resolve(__dirname, 'src/datastore'),
      '@handlers': path.resolve(__dirname, 'src/handlers'),
      '@models': path.resolve(__dirname, 'src/models'),
      '@errors': path.resolve(__dirname, 'src/errors'),
      '@helpers': path.resolve(__dirname, 'src/helpers'),
      '@validators': path.resolve(__dirname, 'src/validators'),
      '@constants': path.resolve(__dirname, 'src/constants'),
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
