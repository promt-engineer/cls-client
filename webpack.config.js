const { getReplacementPluginList } = require('./Replacer');
const { getWebpackConfigurations } = require('gh-client-base/base-webpack.config');

const port = require('./package.json').config.PORT;

const config = getWebpackConfigurations('cleos-riches-flexiways', port, getReplacementPluginList(), __dirname);

module.exports = config;
