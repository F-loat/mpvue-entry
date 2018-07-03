const fs = require('fs');
const path = require('path');
const { Template, Pages } = require('./parser');
const { writeFile, removeFile } = require('./utils/file');

const pages = new Pages();
const template = new Template();

/**
 * @param {Object} paths
 * @param {String} [cause=initial]
 */
function genEntry(paths, cause = 'initial') {
  pages.refresh(paths);
  if (cause !== 'pages') {
    template.refresh(paths);
  }

  if (cause !== 'initial') {
    require.cache[paths.app] = null;
    const app = require(paths.app);

    app.pages = pages.origin
      .filter(page => !page.subPackage)
      .map(page => page.path);

    app.subPackages = pages.origin
      .filter(page => page.subPackage)
      .reduce((result, page) => {
        const root = page.path.replace(/\/.*$/, '');
        const subPath = page.path.replace(/.*?\//, '');
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

    const { home } = template;
    const homeIndex = home ? app.pages.findIndex(page => page === home) : -1;
    if (homeIndex !== -1) {
      app.pages.splice(homeIndex, 1);
      app.pages.unshift(home);
    }

    fs.writeFileSync(paths.app, JSON.stringify(app, null, '  '));
  }

  pages.invalid
    .forEach((page) => {
      const distDir = path.dirname(paths.app);
      const suffixes = ['js', 'json', 'wxml', 'wxss'];

      removeFile(suffixes
        .map(suffix => path.join(distDir, `${page.path}.${suffix}`))
        .concat(page.entry));
    });

  const queue = (cause === 'pages' ? pages.changed : pages.normal)
    .map((page) => {
      const pageConfig = JSON.stringify({ config: page.config }, null, '  ');

      return writeFile(page.entry, template.content
        .replace(/import App from .*/, `import App from '@/${page.path}'`)
        .replace(/export default ?{[^]*}/, `export default ${pageConfig}`));
    });

  const entry = pages.normal
    .reduce((result, page) => Object.assign({}, result, {
      [page.path]: page.entry,
    }), { app: paths.main });

  return Promise.all(queue).then(() => entry);
}

module.exports = genEntry;
