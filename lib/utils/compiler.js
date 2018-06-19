const fs = require('fs');
const path = require('path');
const Pages = require('./pages');
const Template = require('./template');
const { writeFile, removeFile } = require('./file');

const pages = new Pages();
const template = new Template();

/**
 * @param {Object} page
 * @param {Object} paths
 * @param {String} paths.entry - The path of the entry.
 */
function parsePath(page, paths) {
  const pagePath = page.path;
  const fileName = pagePath.replace(/\/(\w)/g, (match, $1) => $1.toUpperCase());
  const entryPath = path.join(paths.entry, `${fileName}.js`);

  return { pagePath, entryPath };
}

/**
 * @param {Object} paths
 * @param {String} [cause=initial]
 */
function genEntry(paths, cause = 'initial') {
  pages.refresh(paths.pages);
  if (cause !== 'pages') {
    template.refresh(paths.template);
  }

  if (cause !== 'initial') {
    require.cache[paths.app] = null;
    const app = require(paths.app);

    app.pages = pages.current.map(page => page.path);

    fs.writeFileSync(paths.app, JSON.stringify(app, null, '  '));
  }

  pages.outdated
    .forEach((oldPage) => {
      const { pagePath, entryPath } = parsePath(oldPage, paths);
      const distDir = path.dirname(paths.app);
      const suffixes = ['js', 'json', 'wxml', 'wxss'];

      removeFile(suffixes
        .map(suffix => path.join(distDir, `${pagePath}.${suffix}`))
        .concat(entryPath));
    });

  const writePages = cause === 'pages' ? pages.changed : pages.normal;
  const writeQueue = writePages.map((page) => {
    const { pagePath, entryPath } = parsePath(page, paths);
    const pageConfig = JSON.stringify({ config: page.config }, null, '  ');

    return writeFile(entryPath, template.content
      .replace(/import App from .*/, `import App from '@/${pagePath}'`)
      .replace(/export default ?{[^]*}/, `export default ${pageConfig}`));
  });

  const entry = pages.normal.reduce(((result, current) => {
    const { pagePath, entryPath } = parsePath(current, paths);
    return Object.assign({}, result, {
      [pagePath]: entryPath,
    });
  }), { app: paths.template });

  return Promise.all(writeQueue).then(() => entry);
}

module.exports = genEntry;
