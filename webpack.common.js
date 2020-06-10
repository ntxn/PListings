// const sassConfig = require('./webpack-config/webpack.sass');
const serverConfig = require('./webpack.server');
const clientConfig = require('./webpack.client');

module.exports = [serverConfig, clientConfig];
