const {
  parsePaths, parsePages, parseTemplate, parseHome,
} = require('./parser');
const { genEntry, genConfig } = require('./compiler');
const { itemToPlugin, DynamicEntryPlugin } = require('./plugins');
const { watchFile, resolveFile } = require('./utils/file');

let paths = null;
let pages = null;
let template = '';
let home = '';

/**
 * class MpvueEntry
 */
class MpvueEntry {
  /**
   * @param {(String|Object)} customPaths
   */
  static getEntry(customPaths = {}) {
    paths = parsePaths(customPaths);
    pages = parsePages(paths);
    template = parseTemplate(paths);
    home = parseHome(template);

    let entry = genEntry(paths, pages, template);

    if (process.env.NODE_ENV === 'development') {
      const files = resolveFile(paths.pages);
      watchFile(files, (file) => {
        require.cache[file] = null;
        pages = parsePages(paths, pages.formated);
        entry = genEntry(paths, pages, template);
        genConfig(paths, pages, home);
      });
      watchFile(paths.template, () => {
        template = parseTemplate(paths);
      });
    }

    return () => entry;
  }

  /**
   * Install Plugin
   * @param {Object} compiler
   */
  apply(compiler) {
    // add parse rule
    const { use, loader } = compiler.options.module.rules.find(rule => rule.test.source === '\\.js$') || {};
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
      compiler.hooks.entryOption.tapAsync(this.constructor.name, entryOption.bind(this));
      compiler.hooks.afterEmit.tapAsync(this.constructor.name, MpvueEntry.afterEmit.bind(this));
    } else {
      // Support Webpack < 4
      compiler.plugin('entry-option', entryOption);
      compiler.plugin('after-emit', MpvueEntry.afterEmit);
    }
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

    const config = compilation.assets['app.json'];
    if (config && config.emitted) {
      pages = parsePages(paths);
      home = parseHome(template);
      genEntry(paths, pages, template);
      genConfig(paths, pages, home);
    }

    callback();
  }
}

module.exports = MpvueEntry;
