const { parsePaths, parsePages, parseTemplate } = require('./parser');
const { genEntry, genConfig } = require('./compiler');
const { itemToPlugin, DynamicEntryPlugin } = require('./plugins');
const { watchFile, resolveFile } = require('./utils/file');
const { resolvePackage } = require('./utils/resolve');

let paths = {};
let pages = {};

const isMegalo = !!resolvePackage().dependencies.megalo;

/**
 * class MpvueEntry
 */
class MpvueEntry {
  /**
   * @param {(String|Object)} customPaths
   * @param {Object} customParsers
   */
  static getEntry(customPaths = {}) {
    paths = parsePaths(customPaths);
    pages = parsePages(paths);

    let template = parseTemplate(paths);
    let entry = genEntry(paths, pages, template);

    if (process.env.NODE_ENV === 'development') {
      watchFile(resolveFile(paths.config), (file) => {
        require.cache[file] = null;
        pages = parsePages(paths, pages.formated);
        entry = genEntry(paths, pages, template);
        genConfig(paths, pages);
      });
      watchFile(paths.template, () => {
        template = parseTemplate(paths);
      });
    }

    return isMegalo ? entry : () => entry;
  }

  /**
   * Install Plugin
   * @param {Object} compiler
   */
  apply(compiler) {
    // add parse rule
    const { use, loader } = compiler.options.module.rules.find(rule =>
      rule.test && rule.test.source === '\\.js$') || {};

    compiler.options.module.rules.push({
      test: /\.js$/,
      include: /mpvue-entry/,
      use,
      loader,
    });

    /**
     * Hack entry parser
     * @param {Object} context
     * @param {Object} entry
     */
    function entryOption(context, entry) {
      if (typeof entry === 'string' || Array.isArray(entry)) {
        compiler.apply(itemToPlugin(context, entry, 'main'));
      } else if (typeof entry === 'object') {
        Object.keys(entry).forEach(name =>
          compiler.apply(itemToPlugin(context, entry[name], name)));
      } else if (typeof entry === 'function') {
        compiler.apply(new DynamicEntryPlugin(context, entry));
      }
      return true;
    }

    if (compiler.hooks) {
      // Support Webpack >= 4
      compiler.hooks.entryOption.tap(this.constructor.name, entryOption.bind(this));
      compiler.hooks.afterEmit.tapAsync(this.constructor.name, MpvueEntry.afterEmit.bind(this));
    } else {
      // Support Webpack < 4
      compiler.plugin('entry-option', entryOption);
      compiler.plugin('after-emit', MpvueEntry.afterEmit);
    }

    paths.dist = compiler.options.output.path;

    genConfig(paths, pages);
  }

  /**
   * After emiting, update dependencies and reset app.json
   * @param {Object} compilation
   * @param {Function} callback
   */
  static afterEmit(compilation, callback) {
    if (Array.isArray(compilation.contextDependencies)) {
      // Support Webpack < 4
      Object.assign(compilation, {
        contextDependencies: compilation.contextDependencies.concat(paths.entry),
      });
    } else {
      // Support Webpack >= 4
      compilation.contextDependencies.add(paths.entry);
    }

    if (isMegalo && compilation.assets['app.json']) {
      genConfig(paths, pages);
    }

    callback();
  }
}

module.exports = MpvueEntry;
