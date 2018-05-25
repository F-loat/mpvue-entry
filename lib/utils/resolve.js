const path = require('path');

/**
 * 项目内文件绝对路径获取函数
 * @param {String} dir
 */
function resolveApp(dir) {
  return path.join(path.dirname(require.main.filename), '..', dir);
}

/**
 * 输出文件绝对路径获取函数
 * @param {String} dir
 */
function resolveModule(dir) {
  return path.join(__dirname, '../..', dir);
}

module.exports = {
  resolveApp,
  resolveModule,
};
