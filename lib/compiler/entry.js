const path = require('path');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const { writeFile, removeFile } = require('../utils/file');

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

  pages.changed
    .filter(page => !page.native)
    .forEach((page) => {
      traverse(template, {
        ImportDeclaration(astPath) {
          const { specifiers } = astPath.node;
          const importNode = specifiers[0] ? specifiers[0].local : {};

          if (importNode.name === 'App') {
            const { source: sourceNode } = astPath.node;
            sourceNode.value = `@/${page.path}`;
          }
        },
      });

      const { code } = generate(template);

      writeFile(page.entry, code);
    });

  return entry;
}

module.exports = genEntry;
