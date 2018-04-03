# mpvue-entry
>通过配置文件自动生成各页面对应的 main.js 文件，并返回 entry

[![npm package](https://img.shields.io/npm/v/mpvue-entry.svg)](https://npmjs.org/package/mpvue-entry)
[![npm downloads](https://img.shields.io/npm/dm/mpvue-entry.svg)](https://npmjs.org/package/mpvue-entry)

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
const genEntry = require('mpvue-entry') // genEntry(config, main?)

module.exports = {
  entry: genEntry('./src/pages.js'),
  ...
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [resolve('src'), resolve('node_modules/mpvue-entry')],
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

``` js
// pages.js
module.exports = [
  {
    path: '/pages/news/list', // 页面路径，同时是 vue 文件相对于 src 的路径
    config: { // 页面配置，即 page.json 的内容
      navigationBarTitleText: '文章列表',
      enablePullDownRefresh: true
    }
  }
]
```

## 示例

* [基础用法](./examples/simple)
* [配置文件复用](./examples/vue-router)
