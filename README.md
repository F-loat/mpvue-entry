# mpvue-entry

> 集中式页面配置，自动生成各页面的入口文件，优化目录结构，支持新增页面热更新

[![npm package](https://img.shields.io/npm/v/mpvue-entry.svg)](https://npmjs.org/package/mpvue-entry)
[![npm downloads](https://img.shields.io/npm/dw/mpvue-entry.svg)](https://npmjs.org/package/mpvue-entry)
[![build status](https://travis-ci.org/F-loat/mpvue-entry.svg?branch=master)](https://travis-ci.org/F-loat/mpvue-entry)
[![codecov](https://codecov.io/gh/F-loat/mpvue-entry/branch/master/graph/badge.svg)](https://codecov.io/gh/F-loat/mpvue-entry/branch/master)
[![codebeat badge](https://codebeat.co/badges/c51b57e4-c809-404e-a825-4271a8e2e01e)](https://codebeat.co/projects/github-com-f-loat-mpvue-entry-master)
[![license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/F-loat/mpvue-entry/blob/master/LICENSE)

## 目录结构

``` txt
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

## Quickstart*

> https://github.com/F-loat/mpvue-quickstart

``` bash
vue init F-loat/mpvue-quickstart my-project
```

## 安装

``` bash
npm i mpvue-entry -D
```

## 使用

> v1.5.0 版本开始支持 mpvue-loader@^1.1.0 版本，新版 src 目录下需存在 app.json 文件，预计 v2.0 版本不再兼容旧版 mpvue-loader

``` js
// webpack.base.conf.js
const MpvueEntry = require('mpvue-entry')

module.exports = {
  entry: MpvueEntry.getEntry('src/pages.js'),
  ...
  plugins: [
    new MpvueEntry(),
    ...
  ]
}
```

``` js
// pages.js
module.exports = [
  {
    path: 'pages/news/list', // 页面路径，同时是 vue 文件相对于 src 的路径，必填
    config: { // 页面配置，即 page.json 的内容，可选
      navigationBarTitleText: '文章列表',
      enablePullDownRefresh: true
    }
  }
]
```

``` js
// 官方模板生成的项目请务必去除以下配置
module.exports = {
  plugins: [
    new CopyWebpackPlugin([{
      from: '**/*.json',
      to: ''
    }], {
      context: 'src/'
    }),
    ...
  ]
}
```

## 参数

``` js
MpvueEntry.getEntry(paths)
```

* paths `String/Object`

paths 为 String 类型时作为 pages 的值，自定义值为绝对路径或相对于项目根目录的相对路径（这里的相对路径实际上是相对于被执行文件的上级目录的）

``` js
// 默认值
{
  // 页面配置文件
  pages: 'src/pages.js',
  // 主入口文件，作为模板
  main: 'src/main.js',
  // 入口模板文件，优先级较高
  template: 'src/main.js',
  // 项目配置文件
  app: 'src/app.json', // 新
  app: 'dist/app.json', // 旧
  // 项目构建目录
  dist: 'dist/',
  // 各页面入口文件目录
  entry: 'mpvue-entry/dist/'
}

// 示例
MpvueEntry.getEntry({
  pages: 'src/router/index.js',
  dist: 'wxapp/',
})
```

## Tips

* 首页默认为 `pages.js` 中的第一项，但会被 `main.js` 中的配置覆盖

* `path` 属性兼容绝对路径，且仅指定 `path` 属性时可简写为字符串形式

``` js
// pages.js
module.exports = [
  '/pages/news/list',
  '/pages/news/detail'
]
```

* 可通过以下形式的注释指定 `main.js` 特有代码

``` js
console.log('hello world') // app-only

/* app-only-begin */
console.log('happy')
console.log('coding')
/* app-only-end */
```

* 可通过 `route` 属性指定页面路由

``` js
// pages.js
module.exports = [
  {
    path: 'pages/news/list',
    route: 'pages/news/list/main',
  }
]
```

* 可通过 `native` 属性指定页面为原生开发，不做编译处理

``` js
// pages.js
module.exports = [
  {
    path: 'pages/news/list',
    native: true
  }
]
```

* 可通过 `subPackage` 属性指定页面需分包加载（配合 [Quickstart](#quickstart) 模板使用效果更佳）

``` js
// pages.js
module.exports = [
  {
    path: 'packageA/news/detail',
    subPackage: true
  }
]
```

* 可通过 `root` 属性指定分包根路径，指定后 `subPackage` 属性会自动置为 `true`
* 可通过 `name` 属性指定分包别名，默认为分包目录名称，用于分包预下载时使用
* 可通过 `independent` 属性指定分包是否是独立分包，默认为非独立分包

``` js
// pages.js
module.exports = [
  {
    path: 'pages/news/detail',
    root: 'pages/news'
  }
]
```

## 示例

> 以 mpvue-loader@1.1.0 为界

* [新版示例](./examples/current)
* [旧版示例](./examples/legacy)

## Thanks

* [webpack-watched-glob-entries-plugin](https://github.com/Milanzor/webpack-watched-glob-entries-plugin)
