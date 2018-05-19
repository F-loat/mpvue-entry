const fs = require('fs');
const SingleEntryPlugin = require('webpack/lib/SingleEntryPlugin');
const MultiEntryPlugin = require('webpack/lib/MultiEntryPlugin');
const DynamicEntryPlugin = require('./plugins/DynamicEntry');
const utils = require('./utils');

function itemToPlugin(context, item, name) {
  if (Array.isArray(item)) {
    return new MultiEntryPlugin(context, item, name);
  }
  return new SingleEntryPlugin(context, item, name);
}

// 默认路径
const paths = {
  // 页面配置文件
  pages: utils.resolveApp('./src/pages.js'),
  // 主入口文件，作为模板
  template: utils.resolveApp('./src/main.js'),
  // 项目 dist 目录
  dist: utils.resolveApp('./dist'),
  // 各页面入口文件目录
  entry: utils.resolveModule('./dist'),
  // 备份文件
  bakPages: utils.resolveModule('./src/pages.bak.js'),
  bakTemplate: utils.resolveModule('./src/template.bak.js'),
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
      pages: utils.resolveApp(customPaths),
    } : Object.keys(customPaths).reduce((accumulator, currentKey) => {
      const currentValue = customPaths[currentKey];
      return Object.assign({}, accumulator, {
        [currentKey]: currentValue && utils.resolveApp(currentValue),
      });
    }, {}));
    Object.assign(options, customOptions);

    // 移除备份文件
    if (!options.cache) {
      const { bakPages, bakTemplate } = paths;
      if (fs.existsSync(bakPages)) fs.unlinkSync(bakPages);
      if (fs.existsSync(bakTemplate)) fs.unlinkSync(bakTemplate);
    }

    // 生成入口
    let entry = utils.genEntry(paths, options);

    if (options.watch) {
      // 监听文件
      fs.watch(paths.pages, () => {
        entry = utils.genEntry(paths, options);
      });
      fs.watch(paths.template, () => {
        entry = utils.genEntry(paths, options);
      });
    }

    if (!options.plugin) {
      return entry;
    }

    return () => entry;
  }

  // eslint-disable-next-line
  apply(compiler) {
    // 添加解析配置
    compiler.options.module.rules.push({
      test: /\.js$/,
      include: [/mpvue-entry/],
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
        Object.keys(entry)
          .forEach(name => compiler.apply(itemToPlugin(context, entry[name], name)));
      } else if (typeof entry === 'function') {
        compiler.apply(new DynamicEntryPlugin(context, entry));
      }
      return true;
    });

    // 更新 app.json
    compiler.plugin('after-emit', (compilation, cb) => {
      utils.resetApp(paths);
      cb();
    });
  }
}

module.exports = MpvueEntry;
