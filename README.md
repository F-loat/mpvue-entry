# mpvue-entry

> 集中式页面配置，自动生成各页面的入口文件，优化目录结构，支持新增页面热更新

[![npm package](https://img.shields.io/npm/v/mpvue-entry.svg)](https://npmjs.org/package/mpvue-entry)
[![npm downloads](https://img.shields.io/npm/dm/mpvue-entry.svg)](https://npmjs.org/package/mpvue-entry)
[![Build Status](https://travis-ci.org/F-loat/mpvue-entry.svg?branch=master)](https://travis-ci.org/F-loat/mpvue-entry)
[![codecov](https://codecov.io/gh/F-loat/mpvue-entry/branch/master/graph/badge.svg)](https://codecov.io/gh/F-loat/mpvue-entry)

## 目录结构

```
├─build
├─config
├─src
│ ├─components
│ ├─pages
│ │  └─news
│ │     │─list.vue
│ │     └─detail.vue
│ ├─App.vue
│ ├─main.js
│ └─pages.js
└─package.json
```

## 原理

以 `src/main.js` 为模板，使用配置文件中的 `path` 及 `config` 属性分别替换 `vue 文件导入路径` 及 `导出信息`

## 安装

``` bash
npm i mpvue-entry -D
```

## 使用

``` js
// webpack.base.conf.js
const MpvueEntry = require('mpvue-entry')

module.exports = {
  entry: MpvueEntry.getEntry('src/pages.js'),
  ...
  plugins: [
    new MpvueEntry() // 启用插件可支持新增页面热更新
  ]
}
```

``` js
// pages.js
module.exports = [
  {
    path: 'pages/news/list', // 页面路径，同时是 vue 文件相对于 src 的路径
    config: { // 页面配置，即 page.json 的内容
      navigationBarTitleText: '文章列表',
      enablePullDownRefresh: true
    }
  }
]
```

## 参数

``` js
MpvueEntry.getEntry(paths[, options])
```

* paths `String/Object`

paths 为 String 类型时作为 pages 的值，自定义值均相对于项目根目录

``` js
// 默认值
{
  // 页面配置文件
  pages: 'src/pages.js',
  // 主入口文件，作为模板
  template: 'src/main.js',
  // 项目 dist 目录
  dist: 'dist/',
  // 各页面入口文件目录
  entry: 'mpvue-entry/dist/',
  // 备份文件
  bakPages: 'mpvue-entry/src/pages.bak.json',
  bakTemplate: 'mpvue-entry/src/template.bak.js'
}

// 示例
MpvueEntry.getEntry({
  pages: 'src/router/index.js',
  dist: 'app',
})
```

* options `Object`

``` js
// 默认值
{
  // 是否启用缓存
  cache: true,
  // 是否监听改动
  watch: true,
  // 是否启用插件
  plugin: true
}

// 示例
MpvueEntry.getEntry('src/pages.js', {
  cache: false
})
```

## Tips

* 首页为 `pages.js` 里的第一个页面，会忽略 `main.js` 中的配置

``` js
// pages.js
module.exports = [
  {
    path: 'pages/news/list', // 首页
    path: 'pages/news/detail'
  }
]
```

* 在 `src/main.js` 中引用文件时需通过 `@` 标识引用

``` js
// 正确
import App from '@/App'

// 错误
import App from './App'
```

* 需在 `src/App.vue` 或 `src/main.js` 中指定 `mpType` 为 `app`

``` js
// App.vue
export default {
  mpType: 'app'
}

// 或 main.js
App.mpType = 'app'
```

* path 属性兼容绝对路径，例如 `/pages/news/list`

* 若不启用插件需自行修改 `rule` 配置，并将 `plugin` 选项设置为 `false`

``` js
// webpack.base.conf.js
const MpvueEntry = require('mpvue-entry')

module.exports = {
  entry: MpvueEntry.getEntry('src/pages.js', { plugin: false }),
  ...
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [resolve('src'), /mpvue-entry/],
        use: [
          'babel-loader',
          {
            loader: 'mpvue-loader',
            options: {
              checkMPEntry: true
            }
          }
        ]
      }
    ]
  }
}
```

## 示例

* [基础用法](./examples/simple)
* [配置文件复用](./examples/vue-router)
