const path = require('path');
const { writeFile } = require('../utils/file');

/**
 * @param {Object} paths
 * @param {String} paths.config
 * @param {Object} pages
 * @param {Array} pages.formated
 */
function genConfig(paths, pages) {
  require.cache[paths.config] = null;
  const config = require(paths.config);

  config.pages = pages.formated
    .filter(page => !page.subPackage)
    .map(page => page.route);

  config.subPackages = pages.formated
    .filter(page => page.subPackage)
    .reduce((result, page) => {
      const root = page.root || page.route.replace(/\/.*$/, '');
      const name = page.name || root;
      const independent = page.independent || false;
      const subPath = page.route.replace(`${root}/`, '');
      const subIndex = result.findIndex(subPackage => subPackage.root === root);
      if (subIndex === -1) {
        result.push({
          root,
          name,
          independent,
          pages: [subPath],
        });
      } else {
        result[subIndex].pages.push(subPath);
      }
      return result;
    }, []);

  pages.changed
    .filter(page => !!page.config)
    .forEach((page) => {
      const pageConfigPath = path.join(paths.dist, `${page.route}.json`);
      writeFile(pageConfigPath, JSON.stringify(page.config, null, '  '));
    });

  const appConfigPath = path.join(paths.dist, 'app.json');
  writeFile(appConfigPath, JSON.stringify(config, null, '  '));
}

module.exports = genConfig;
