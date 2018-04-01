# mpvue-entry
通过配置文件自动生成各页面对应的 main.js 文件，并返回 entry

## 安装
``` bash
npm i mpvue-entry -D
```

## 使用
``` js
// webpack.base.conf.js
const genEntry = require('mpvue-entry')

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
    path: 'pages/news/list', // 页面路径，同时是文件相对于 src 的路径
    config: { // 页面配置，即 page.json 的内容
      navigationBarTitleText: '文章列表',
      enablePullDownRefresh: true
    }
  }
]
```

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
