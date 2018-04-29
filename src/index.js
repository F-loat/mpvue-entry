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

  let entry = utils.genEntry(paths);

  // 监听文件
  fs.watch(paths.pages, () => {
    utils.resetApp(paths);
    entry = utils.genEntry(paths);
  });
  fs.watch(paths.template, () => {
    utils.resetApp(paths);
    entry = utils.genEntry(paths);
  });

  return () => entry;
}

module.exports = getEntry;
