const loaderInfo = require('mpvue-loader/package.json');

const loaderVersion = loaderInfo.version.split('.');

const isOldLoader = loaderVersion[0] === '1' && loaderVersion[1] === '0';

module.exports = isOldLoader;
