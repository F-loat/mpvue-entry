const path = require('path');
const { equalConfig } = require('../utils/equal');

/**
 * @param {Object} paths
 * @param {String} paths.config
 * @param {String} paths.entry
 * @param {Array} [oldPages]
 */
function parsePages(paths, oldPages = []) {
  require.cache[paths.config] = null;
  const { pages } = require(paths.config);

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

module.exports = parsePages;
