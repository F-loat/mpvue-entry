const { resolveApp, resolveModule } = require('./utils/resolve');
const { watchFile, resolveFile } = require('./utils/file');
const { genEntry } = require('./utils/compiler');
const { itemToPlugin, DynamicEntryPlugin } = require('./utils/plugin');

// 默认路径
const paths = {
  // 页面配置文件
  pages: resolveApp('./src/pages.js'),
  // 主入口文件，作为模板
  template: resolveApp('./src/main.js'),
  // 项目配置文件
  app: resolveApp('./dist/app.json'),
  // 入口文件目录
  entry: resolveModule('./dist'),
};

/**
 * class MpvueEntry
 */
class MpvueEntry {
  /**
   * @param {(String|Object)} customPaths
   * @returns {Function}
   */
  static getEntry(customPaths) {
    // 合并参数
    Object.assign(paths, typeof customPaths === 'string' ? {
      pages: resolveApp(customPaths),
    } : Object.keys(customPaths).reduce((accumulator, currentKey) => {
      const currentValue = customPaths[currentKey];
      return Object.assign({}, accumulator, {
        [currentKey]: currentValue && resolveApp(currentValue),
      });
    }, {}));

    let entry = genEntry(paths, 'initial');

    if (process.env.NODE_ENV === 'development') {
      const files = resolveFile(paths.pages);
      watchFile(files, (file) => {
        require.cache[file] = null;
        entry = genEntry(paths, 'pages');
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
    compiler.options.module.rules.push({
      test: /\.js$/,
      include: /mpvue-entry/,
      use: [
        'babel-loader',
        {
          loader: 'mpvue-loader',
          options: {
            checkMPEntry: true,
          },
        },
      ],
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
    if (compilation.assets['app.json'].emitted) {
      genEntry(paths, 'template');
    }
    callback();
  }
}

module.exports = MpvueEntry;
