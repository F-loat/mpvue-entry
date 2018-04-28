const fs = require('fs');
const utils = require('./utils');

function getEntry(...arg) {
  // 获取各文件的绝对路径
  const paths = {
    pages: utils.resolveApp(arg[0]),
    bakPages: utils.resolveModule('./dist/pages.bak.js'),
    template: utils.resolveApp(arg[1] || './src/main.js'),
    bakTemplate: utils.resolveModule('./dist/template.bak.js'),
    app: utils.resolveApp(arg[2] || './dist/app.json'),
  };

  return () => {
    let enrty = utils.genEntry(paths);

    // 监听文件
    fs.watch(paths.pages, () => {
      enrty = utils.genEntry(paths);
    });
    fs.watch(paths.template, () => {
      enrty = utils.genEntry(paths);
    });

    return enrty;
  };
}

module.exports = getEntry;
