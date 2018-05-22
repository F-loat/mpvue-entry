const {
  resolveApp,
  resolveModule,
  watchFile,
  removeFile,
  genEntry,
  resetApp,
  itemToPlugin,
  DynamicEntryPlugin,
} = require('./utils');

// 默认路径
const paths = {
  // 页面配置文件
  pages: resolveApp('./src/pages.js'),
  // 主入口文件，作为模板
  template: resolveApp('./src/main.js'),
  // 项目 dist 目录
  dist: resolveApp('./dist'),
  // 各页面入口文件目录
  entry: resolveModule('./dist'),
  // 备份文件
  bakPages: resolveModule('./src/pages.bak.json'),
  bakTemplate: resolveModule('./src/template.bak.js'),
};

// 默认配置
const options = {
  // 是否启用缓存
  cache: true,
  // 是否监听改动
  watch: true,
  // 是否启用插件
  plugin: true,
};

class MpvueEntry {
  static getEntry(customPaths, customOptions) {
    // 合并参数
    Object.assign(paths, typeof customPaths === 'string' ? {
      pages: resolveApp(customPaths),
    } : Object.keys(customPaths).reduce((accumulator, currentKey) => {
      const currentValue = customPaths[currentKey];
      return Object.assign({}, accumulator, {
        [currentKey]: currentValue && resolveApp(currentValue),
      });
    }, {}));
    Object.assign(options, customOptions);

    // 移除备份文件
    if (!options.cache) {
      const { bakPages, bakTemplate } = paths;
      removeFile([bakPages, bakTemplate]);
    }

    // 生成入口
    let entry = genEntry(paths, options);

    // 监听文件
    if (options.watch) {
      const { pages, template } = paths;
      watchFile([pages, template], () => {
        entry = genEntry(paths, options);
      });
    }

    if (!options.plugin) return entry;

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
    compiler.plugin('after-emit', (compilation, cb) => {
      resetApp(paths);
      cb();
    });
  }
}

module.exports = MpvueEntry;
