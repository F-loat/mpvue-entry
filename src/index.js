const fs = require('fs');
const utils = require('./utils');

function getEntry(customPaths, customOptions) {
  // 默认路径
  const defaultPaths = {
    // 页面配置文件
    pages: utils.resolveApp('./src/pages.js'),
    // 主入口文件，作为模板
    template: utils.resolveApp('./src/main.js'),
    // 项目 dist 目录
    dist: utils.resolveApp('./dist'),
    // 各页面入口文件目录
    entry: utils.resolveModule('./dist'),
    // 备份文件
    bakPages: utils.resolveModule('./src/pages.bak.js'),
    bakTemplate: utils.resolveModule('./src/template.bak.js'),
  };

  // 默认配置
  const defaultOptions = {
    // 是否启用缓存
    cache: true,
  };

  // 合并参数
  const paths = Object.assign({}, defaultPaths, typeof customPaths === 'string' ? {
    pages: utils.resolveApp(customPaths),
  } : Object.keys(customPaths).reduce((accumulator, currentKey) => {
    const currentValue = customPaths[currentKey];
    return Object.assign({}, accumulator, {
      [currentKey]: currentValue && utils.resolveApp(currentValue),
    });
  }, {}));
  const options = Object.assign({}, defaultOptions, customOptions);

  // 移除备份文件
  if (!options.cache) {
    const { bakPages, bakTemplate } = paths;
    if (fs.existsSync(bakPages)) fs.unlinkSync(bakPages);
    if (fs.existsSync(bakTemplate)) fs.unlinkSync(bakTemplate);
  }

  // 生成入口
  let entry = utils.genEntry(paths, options);

  // 监听文件
  fs.watch(paths.pages, () => {
    entry = utils.genEntry(paths, options);
  });
  fs.watch(paths.template, () => {
    entry = utils.genEntry(paths, options);
  });

  return entry;
}

module.exports = getEntry;
