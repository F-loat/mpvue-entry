const fs = require('fs');
const path = require('path');
const { watchFile, writeFile, removeFile } = require('./file');
const { resolveApp, resolveModule } = require('./resolve');
const { isPagesChanged, isConfigChanged } = require('./equal');
const { itemToPlugin, DynamicEntryPlugin } = require('./plugin');

// 重置配置文件
function resetApp(paths) {
  const appPath = path.join(paths.dist, 'app.json');

  // 清除 require 缓存
  require.cache[appPath] = null;
  require.cache[paths.pages] = null;

  const app = require(appPath);
  const pages = require(paths.pages);

  app.pages = pages.map(page => page.path.replace(/^\//, ''));

  const data = JSON.stringify(app, null, '  ');

  // 生产模式需同步写入文件
  if (process.env.NODE_ENV === 'production') {
    fs.writeFileSync(appPath, data);
  } else {
    writeFile(appPath, data);
  }
}

// 生成入口文件
function genEntry(paths, reset) {
  // 清除 require 缓存
  require.cache[paths.pages] = null;
  require.cache[paths.bakPages] = null;

  // 获取所有新旧页面的配置
  const pages = require(paths.pages);
  const oldPages = fs.existsSync(paths.bakPages) ? require(paths.bakPages) : [];

  if (reset && isPagesChanged(pages, oldPages)) {
    resetApp(paths);
  }

  // 获取新旧入口文件模板
  let template = fs.readFileSync(paths.template).toString().replace(/\n*.*mpType.*\n*/, '\n\n');
  const bakTemplate = fs.existsSync(paths.bakTemplate) ? fs.readFileSync(paths.bakTemplate).toString() : '';

  // 去除 mixin 混入语句
  const mixinReg = /\n*Vue\.mixin(.*).*\n*/;
  while (mixinReg.test(template)) {
    template = template.replace(mixinReg, '\n\n')
      // 去除 mixin 文件导入语句
      .replace(new RegExp(`\n*import ${RegExp.$1 || null}.*\n*`), '\n\n');
  }

  const isTemplateChanged = template !== bakTemplate;

  // 创建入口配置对象
  const entry = { app: paths.template };

  // 生成入口文件的队列
  const queue = pages.map((page) => {
    // 页面路径
    const pagePath = page.path.replace(/^\//, '');

    // 页面配置
    const pageConfig = JSON.stringify({ config: page.config }, null, '  ');

    // 入口文件的文件名
    const fileName = page.name || pagePath.replace(/\/(\w)/g, (match, $1) => $1.toUpperCase());

    // 入口文件的完整路径
    const entryPath = path.join(paths.entry, `${fileName}.js`);

    entry[pagePath] = entryPath;

    if (isTemplateChanged || isConfigChanged(page, oldPages)) {
      // 生成入口文件
      return writeFile(entryPath, template
        .replace(/import App from .*/, `import App from '@/${pagePath}'`)
        .replace(/export default ?{[^]*}/, `export default ${pageConfig}`));
    }

    return Promise.resolve();
  });

  return Promise.all(queue).then(() => entry);
}

module.exports = {
  resolveApp,
  resolveModule,
  watchFile,
  writeFile,
  removeFile,
  genEntry,
  resetApp,
  itemToPlugin,
  DynamicEntryPlugin,
};
