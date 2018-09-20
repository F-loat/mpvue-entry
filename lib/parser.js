const fs = require('fs');
const path = require('path');
const { equalConfig } = require('./utils/equal');
const { resolveApp, resolveModule } = require('./utils/resolve');
const isOldLoader = require('./utils/version');

/**
 * @param {(Object|String)} [paths]
 * @param {String} [paths.pages]
 * @param {String} [paths.main]
 * @param {String} [paths.template]
 * @param {String} [paths.app]
 * @param {String} [paths.dist]
 * @param {String} [paths.entry]
 */
function parsePaths(paths) {
  const {
    pages, main, template, app, dist, entry,
  } = typeof paths === 'string' ? { pages: paths } : paths;

  return {
    // 页面配置文件
    pages: resolveApp(pages || './src/pages.js'),
    // 主入口文件，作为模板
    main: resolveApp(main || './src/main.js'),
    // 入口模板文件，优先级较高
    template: resolveApp(template || main || './src/main.js'),
    // 项目配置文件
    app: resolveApp(app || (isOldLoader ? './dist/app.json' : './src/app.json')),
    // 项目构建目录
    dist: resolveApp(dist || './dist'),
    // 入口文件目录
    entry: entry ? resolveApp(entry) : resolveModule('./dist'),
  };
}

/**
 * @param {Object} paths
 * @param {String} paths.pages
 * @param {String} paths.entry
 * @param {Array} [oldPages]
 */
function parsePages(paths, oldPages = []) {
  require.cache[paths.pages] = null;
  const pages = require(paths.pages);

  const formatedPages = pages
    .map((page) => {
      const fdPage = typeof page === 'string' ? { path: page } : page;
      const entryName = fdPage.path.replace(/\/(\w)/g, (match, $1) => $1.toUpperCase());
      fdPage.path = fdPage.path.replace(/^\//, '');
      fdPage.route = fdPage.route ? fdPage.route.replace(/^\//, '') : fdPage.path.replace(/\.vue$/, '');
      fdPage.root = fdPage.root && fdPage.root.replace(/^\/|\/$/g, '');
      fdPage.entry = path.join(paths.entry, `${entryName}.js`);
      fdPage.subPackage = fdPage.subPackage || !!fdPage.root;
      return fdPage;
    });

  const pagesMap = new Map(formatedPages.map(page => [page.path, page]));
  const oldPagesMap = new Map(oldPages.map(oldPage => [oldPage.path, oldPage]));

  const changedPages = formatedPages
    .filter((page) => {
      const oldPage = oldPagesMap.get(page.path);
      if (oldPage && equalConfig(page, oldPage)) {
        return false;
      }
      return true;
    });

  const invalidPages = oldPages
    .filter(page => !pagesMap.has(page.path));

  return {
    formated: formatedPages,
    changed: changedPages,
    invalid: invalidPages,
  };
}

/**
 * @param {Object} paths
 * @param {String} paths.template
 */
function parseTemplate(paths) {
  const mixinReg = /Vue\.mixin\((.*)\).*/;
  const relativeReg = /import (.* from )?['|"](\..*)['|"]/;

  let template = fs.readFileSync(paths.template).toString()
    .replace(/.*mpType.*/, '')
    .replace(/.*app-only-begin[^]*?app-only-end.*/g, '')
    .replace(/.*app-only.*/g, '')
    .replace(/!:\/\/.*/g, '')
    .replace(/\/\*[^]*?\*\//g, '');

  while (mixinReg.test(template)) {
    template = template.replace(mixinReg, '')
      .replace(new RegExp(`import ${RegExp.$1 || null}.*\n`), '');
  }
  while (relativeReg.test(template)) {
    template = template.replace(relativeReg, (match, $1, $2) => {
      const templateDir = path.dirname(paths.template);
      const absolutePath = path.join(templateDir, $2).replace(/\\/g, '\\\\');
      return match.replace($2, absolutePath);
    });
  }

  return template.replace(/[\r?\n]{2,}/g, '\n\n');
}

/**
 * @param {String} template
 */
function parseHome(template) {
  return /pages:[^]*?\^(.*?)['|"]/.test(template) ? RegExp.$1 : '';
}

module.exports = {
  parsePaths,
  parseTemplate,
  parseHome,
  parsePages,
};
