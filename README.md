# mpvue-entry

> 集中式页面配置，自动生成各页面的入口文件，优化目录结构，支持新增页面热更新

[![npm package](https://img.shields.io/npm/v/mpvue-entry.svg)](https://npmjs.org/package/mpvue-entry)
[![npm downloads](https://img.shields.io/npm/dw/mpvue-entry.svg)](https://npmjs.org/package/mpvue-entry)
[![build status](https://travis-ci.org/F-loat/mpvue-entry.svg?branch=master)](https://travis-ci.org/F-loat/mpvue-entry)
[![codecov](https://codecov.io/gh/F-loat/mpvue-entry/branch/master/graph/badge.svg)](https://codecov.io/gh/F-loat/mpvue-entry)
[![codebeat badge](https://codebeat.co/badges/c51b57e4-c809-404e-a825-4271a8e2e01e)](https://codebeat.co/projects/github-com-f-loat-mpvue-entry-master)
[![license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/F-loat/mpvue-entry/blob/master/LICENSE)

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
MpvueEntry.getEntry(paths)
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
  // 项目配置文件
  app: 'dist/app.json',
  // 各页面入口文件目录
  entry: 'mpvue-entry/dist/'
}

// 示例
MpvueEntry.getEntry({
  pages: 'src/router/index.js',
  app: 'wxapp/app.json',
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

## 示例

* [基础用法](./examples/simple)
* [配置文件复用](./examples/vue-router)

## Thanks

* [webpack-watched-glob-entries-plugin](https://github.com/Milanzor/webpack-watched-glob-entries-plugin)
