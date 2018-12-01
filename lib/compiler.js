const fs = require('fs');
const path = require('path');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const { makeDir, writeFile, removeFile } = require('./utils/file');

/**
 * @param {Object} paths
 * @param {String} paths.dist
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
      [page.route]: page.entry,
    }), { app: paths.main });

  pages.invalid
    .forEach((page) => {
      const suffixes = ['js', 'js.map', 'json', 'wxml', 'vue.wxml', 'wxss'];

      removeFile(suffixes
        .map(suffix => path.join(paths.dist, `${page.route}.${suffix}`))
        .concat(page.entry));
    });

  const queue = pages.changed
    .filter(page => !page.native)
    .map((page) => {
      traverse(template, {
        ImportDeclaration: {
          enter(astPath) {
            const importNode = astPath.node.specifiers[0].local;

            if (importNode.name === 'App') {
              const { source: sourceNode } = astPath.node;
              sourceNode.value = `@/${page.path}`;
            }
          },
        },
      });

      const { code } = generate(template);

      return writeFile(page.entry, code);
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
  const app = fs.existsSync(paths.app) ? require(paths.app) : {};

  app.pages = pages.formated
    .filter(page => !page.subPackage)
    .map(page => page.route);

  app.subPackages = pages.formated
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
    .forEach((page) => {
      const pageConfig = JSON.stringify(page.config || {}, null, '  ');

      writeFile(path.join(paths.dist, `${page.route}.json`), pageConfig);
    });

  const homeIndex = home ? app.pages.findIndex(page => page === home) : -1;
  if (homeIndex !== -1) {
    app.pages.splice(homeIndex, 1);
    app.pages.unshift(home);
  }

  makeDir(paths.dist).then(() => {
    const configPath = path.join(paths.dist, 'app.json');
    fs.writeFileSync(configPath, JSON.stringify(app, null, '  '));
  });
}

module.exports = {
  genEntry,
  genConfig,
};
