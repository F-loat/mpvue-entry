const { resolveApp, resolveModule } = require('./utils/resolve');
const { watchFile } = require('./utils/file');
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

class MpvueEntry {
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
      watchFile(paths.pages, () => {
        entry = genEntry(paths, 'pages');
      });
    }

    return () => entry;
  }

  // eslint-disable-next-line
  apply(compiler) {
    // 添加解析配置
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

    // hack 入口解析
    compiler.plugin('entry-option', (context, entry) => {
      if (typeof entry === 'string' || Array.isArray(entry)) {
        compiler.apply(itemToPlugin(context, entry, 'main'));
      } else if (typeof entry === 'object') {
        Object.keys(entry).forEach(name =>
          compiler.apply(itemToPlugin(context, entry[name], name)));
      } else if (typeof entry === 'function') {
        compiler.apply(new DynamicEntryPlugin(context, entry));
      }
      return true;
    });

    // 更新 app.json
    compiler.plugin('after-emit', (compilation, callback) => {
      Object.assign(compilation, {
        contextDependencies: compilation.contextDependencies.concat(paths.entry),
      });
      if (compilation.assets['app.json'].emitted) {
      genEntry(paths, 'template');
      }
      callback();
    });
  }
}

module.exports = MpvueEntry;
