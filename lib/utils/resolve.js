const path = require('path');

// 项目内文件绝对路径获取函数
function resolveApp(dir) {
  return path.join(path.dirname(require.main.filename), '..', dir);
}

// 输出文件绝对路径获取函数
function resolveModule(dir) {
  return path.join(__dirname, '../..', dir);
}

module.exports = {
  resolveApp,
  resolveModule,
};
