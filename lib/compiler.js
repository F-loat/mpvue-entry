const fs = require('fs');
const path = require('path');
const { writeFile, removeFile } = require('./utils/file');

/**
 * @param {Object} paths
 * @param {String} paths.app
 * @param {String} paths.main
 * @param {Object} pages
 * @param {Array} pages.invalid
 * @param {Array} pages.changed
 * @param {String} template
 */
function genEntry(paths, pages, template) {
  const entry = pages.formated
    .filter(page => !page.native)
    .reduce((result, page) => Object.assign({}, result, {
      [page.path]: page.entry,
    }), { app: paths.main });

  pages.invalid
    .forEach((page) => {
      const distDir = path.dirname(paths.app);
      const suffixes = ['js', 'json', 'wxml', 'wxss'];

      removeFile(suffixes
        .map(suffix => path.join(distDir, `${page.path}.${suffix}`))
        .concat(page.entry));
    });

  const queue = pages.changed
    .filter(page => !page.native)
    .map((page) => {
      template = template.replace(/export default ?{[^]*}/, `export default ${pageConfig}`)
      if (page.path.startsWith('cbframework')) {
        template = template.replace(/import App from .*/, `import App from 'cbframework/${page.path.replace(/cbframework\//, '')}'`)
      } else {
        template = template.replace(/import App from .*/, `import App from '@/${page.path}'`)
      }

      return writeFile(page.entry, template);
    });

  return Promise.all(queue).then(() => entry);
}

/**
 * @param {Object} paths
 * @param {String} paths.app
 * @param {Object} pages
 * @param {Array} pages.formated
 * @param {String} template
 */
function genConfig(paths, pages, home) {
  require.cache[paths.app] = null;
  const app = require(paths.app);

  app.pages = pages.formated
    .filter(page => !page.subPackage)
    .map(page => page.path);

  app.subPackages = pages.formated
    .filter(page => page.subPackage)
    .reduce((result, page) => {
      const root = page.root || page.path.replace(/\/.*$/, '');
      const subPath = page.path.replace(`${root}/`, '');
      const subIndex = result.findIndex(subPackage => subPackage.root === root);
      if (subIndex === -1) {
        result.push({
          root,
          pages: [subPath],
        });
      } else {
        result[subIndex].pages.push(subPath);
      }
      return result;
    }, []);

  const homeIndex = home ? app.pages.findIndex(page => page === home) : -1;
  if (homeIndex !== -1) {
    app.pages.splice(homeIndex, 1);
    app.pages.unshift(home);
  }

  fs.writeFileSync(paths.app, JSON.stringify(app, null, '  '));
}

module.exports = {
  genEntry,
  genConfig,
};
