const replacer = require('./node_modules/gh-client-base/src/Replacer').getReplacementPluginList;

const paths = [
  // example
  // ['@base/overlay/sources/Overlay', '@/components/overlay/sources/Overlay'],
];

function getReplacementPluginList() {
  return replacer(paths);
}

module.exports = {
  getReplacementPluginList,
};
