const path = require('path');

/**
 * 项目内文件绝对路径获取函数
 * @param {String} dir
 */
function resolveApp(dir) {
  if (path.isAbsolute(dir)) return dir;
  return path.join(process.cwd(), dir);
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
