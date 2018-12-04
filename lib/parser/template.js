const fs = require('fs');
const path = require('path');
const babelParser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const removeImportBySpecifier = (ast, name) => {
  traverse(ast, {
    ImportDeclaration: {
      enter(astPath) {
        const importNode = astPath.node.specifiers[0].local;

        if (importNode.name === name) {
          astPath.remove();
        }
      },
    },
  });
};

/**
 * @param {Object} paths
 * @param {String} paths.template
 */
function parseTemplate(paths) {
  const template = fs.readFileSync(paths.template).toString()
    .replace(/.*app-only-begin[^]*?app-only-end.*/g, '')
    .replace(/.*app-only.*/g, '');

  const ast = babelParser.parse(template, {
    sourceType: 'module',
    plugins: [
      'objectRestSpread',
      'decorators-legacy',
    ],
  });

  traverse(ast, {
    ImportDeclaration(astPath) {
      const { source: sourceNode } = astPath.node;
      if (/\..*/.test(sourceNode.value)) {
        const templateDir = path.dirname(paths.template);
        const absolutePath = path.join(templateDir, sourceNode.value);

        sourceNode.value = absolutePath.replace(/\\/g, '\\\\');
      }
    },
    CallExpression(astPath) {
      const {
        object: objectNode,
        property: propertyNode,
      } = astPath.node.callee;

      if (
        objectNode &&
        objectNode.name === 'Vue' &&
        propertyNode.name === 'mixin'
      ) {
        const mixinNode = astPath.node.arguments[0];
        removeImportBySpecifier(ast, mixinNode.name);
        astPath.remove();
      }
    },
    NewExpression(astPath) {
      const argumentNode = astPath.node.arguments[0];
      if (!argumentNode.properties) {
        return;
      }
      argumentNode.properties.forEach((prop) => {
        const { key, value } = prop;
        if (key && key.name === 'mpType') {
          value.value = 'page';
        }
      });
    },
    ExportDefaultDeclaration(astPath) {
      astPath.remove();
    },
  });

  return ast;
}

module.exports = parseTemplate;
