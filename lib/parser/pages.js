const path = require('path');
const { equalConfig } = require('../utils/equal');

/**
 * @param {Object} paths
 * @param {String} paths.config
 * @param {String} paths.entry
 * @param {Array} [oldPages]
 */
function parsePages(paths, oldPages = []) {
  delete require.cache[paths.config];
  const config = require(paths.config);
  const { pages, subPackages } = Array.isArray(config) ? { pages: config } : config;

  const formatedSubPackages = subPackages ? subPackages.reduce((result, subPackage) => {
    if (!subPackage.pages) return result;

    return result.concat(subPackage.pages.map((page) => {
      const subPackageInfo = {
        root: subPackage.root,
        name: subPackage.name,
        independent: subPackage.independent,
      };

      if (typeof page === 'object') {
        return Object.assign(subPackageInfo, page, {
          path: `${subPackage.root}/${page.path}`,
        });
      }

      return Object.assign(subPackageInfo, {
        path: `${subPackage.root}/${page}`,
      });
    }));
  }, []) : [];

  const formatedPages = pages
    .concat(formatedSubPackages)
    .map((page) => {
      const fdPage = typeof page === 'string' ? { path: page } : page;
      const entryName = fdPage.path.replace(/[.\\/]+(\w)/g, (match, $1) => $1.toUpperCase());
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
