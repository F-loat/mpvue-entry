# mpvue-entry

> 自动生成构建入口，避免编写大量重复的 main.js 文件

[![npm package](https://img.shields.io/npm/v/mpvue-entry.svg)](https://npmjs.org/package/mpvue-entry)
[![npm downloads](https://img.shields.io/npm/dm/mpvue-entry.svg)](https://npmjs.org/package/mpvue-entry)
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
│ ├─app.json
│ └─main.js
└─package.json
```

## Quickstart

> https://github.com/F-loat/mpvue-quickstart

``` bash
vue init F-loat/mpvue-quickstart my-project
```

## 安装

``` bash
npm i mpvue-entry@next -D
```

## 使用

> v2.0 版本仅支持 mpvue-loader@^1.1.0，兼容 megalo

``` js
// webpack.base.conf.js
const MpvueEntry = require('mpvue-entry')

module.exports = {
  entry: MpvueEntry.getEntry('src/app.json'),
  ...
  plugins: [
    new MpvueEntry(),
    ...
  ]
}
```

``` js
// app.json - 支持 js 格式，兼容微信小程序官方配置规范
{
  "pages": [
    {
      "path": "pages/news/list", // 页面路径，同时是 vue 文件相对于 src 的路径，必填
      "config": { // 页面配置，即 page.json 的内容，可选
        "navigationBarTitleText": "文章列表",
        "enablePullDownRefresh": true
      }
    }
  ],
  "window": {}
}
```

## 参数

* paths: `String/Object`

> paths 为 `String` 类型时作为 config 的值，为绝对路径或相对于项目根目录的相对路径

| property | default | describe |
| :-: | :-: | :-: |
| config | 'src/app.json' | 项目配置文件 |
| main | 'src/main.js' | 主入口文件，作为模板 |
| template | 'src/main.js' | 入口模板文件，优先级较高 |
| entry | 'mpvue-entry/dist/' | 各页面入口文件目录 |

``` js
// 示例
MpvueEntry.getEntry({
  config: 'src/app.js',
  main: 'src/index.js'
})
```

* pages `[String/Object]`

> pages 元素为 `String` 类型时作为 path 的值，为绝对路径或相对于项目根目录的相对路径

| property | type | default | describe |
| :-: | :-: | :-: | :-: |
| path | String | - | 文件路径 |
| config | Object | {} | 页面配置 |
| route |String | - | 页面路由 |
| native | Boolean | false | 原生页面 |
| subPackage | Boolean | false | [分包加载](#quickstart) |
| root | String | - | 分包根路径 |
| name | String | `root` | 分包别名 |
| independent | Boolean | false | 独立分包 |

``` js
// 示例
[
  'pages/index',
  {
    path: 'pages/news/list',
    config: {
      navigationBarTitleText: '页面标题'
    },
    route: 'pages/news/list/main'
  },
  {
    path: 'package/news/detail',
    root: 'package/news',
    subPackage: true,
    independent: true
  }
]
```

## Tips

* 首页为 `pages` 数组的第一项

* 分包配置兼容微信小程序官方写法

* paths 的[相关配置](#参数)均可在项目 package.json 的 entryOptions 中覆盖

* 可通过以下形式的注释指定 `main.js` 特有代码

``` js
console.log('hello world') // app-only

/* app-only-begin */
console.log('happy')
console.log('coding')
/* app-only-end */
```

* 官方模板生成的项目请务必去除以下配置

``` js
// webpack.base.conf.js
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

* megalo 官方已对打包入口做了类似的优化，如无迁移需求可直接采用[官方方案](https://github.com/kaola-fed/megalo-aot/pull/22)

## Thanks

* [webpack-watched-glob-entries-plugin](https://github.com/Milanzor/webpack-watched-glob-entries-plugin)
