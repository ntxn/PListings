const merge = require('webpack-merge');
const configs = require('./webpack.common');

const modeConfig = { mode: 'development' };

module.exports = configs.map(config => merge(config, modeConfig));
