const path = require('path');
const merge = require('webpack-merge');
const baseConfig = require('./webpack.base');
const webpackNodeExternals = require('webpack-node-externals');

const config = {
  // Inform webpack that we're building a bundle for nodeJS rather than for browsers
  target: 'node',

  // Tell webpack the root file of server application
  entry: './src/server/index.ts',

  // Tell webpack where to put the output file that's generated
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'build'),
  },

  externals: [webpackNodeExternals()],
};

module.exports = merge(baseConfig, config);
