const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const watchr = require('watchr');

/**
 * 是否为原生模块
 * @param {String} moduleName
 */
let nativeModules = [];
function isNativeModule(moduleName) {
  if (!nativeModules.length) {
    const regexp = /NativeModule/i;
    nativeModules = process
      .moduleLoadList
      .filter(e => regexp.test(e))
      .map(e => e.replace(regexp, '').trim());
  }
  return nativeModules.includes(moduleName);
}

/**
 * 文件夹创建函数
 * @param {String)} file
 */
function makeDir(file) {
  return new Promise((resolve, reject) => {
    mkdirp(path.extname(file) ? path.dirname(file) : file, (err) => {
      if (err) reject(err);
      resolve();
    });
  });
}

/**
 * 文件监听函数
 * @param {(String|String[])} files
 * @param {Function} callback
 */
function watchFile(files, callback) {
  [].concat(files).forEach((file) => {
    watchr.open(file, (changeType) => {
      if (changeType === 'update') {
        callback(file);
      }
    }, (err) => {
      if (err && err.code !== 'ENOENT') {
        throw err;
      }
    });
  });
}

/**
 * 文件写入函数
 * @param {String} file
 * @param {*} data
 */
function writeFile(file, data) {
  return new Promise((resolve, reject) => {
    makeDir(file).then(() => {
      fs.writeFile(file, data, (err) => {
        if (err) reject(err);
        resolve();
      });
    });
  });
}

/**
 * 文件移除函数
 * @param {(String|String[])} files
 */
function removeFile(files) {
  return [].concat(files).map(file =>
    new Promise((resolve, reject) => {
      fs.unlink(file, (err) => {
        if (err && err.code !== 'ENOENT') reject(err);
        resolve();
      });
    }));
}

/**
 * 依赖获取函数
 * @param {String} file
 */
function resolveFile(file) {
  const files = [file];
  const fileDir = path.dirname(require.resolve(file));
  const fileData = fs.readFileSync(file).toString();
  const regexp = /require\(['|"](.*)['|"]\)/g;

  while (regexp.exec(fileData) !== null) {
    const moduleFile = RegExp.$1;
    if (!isNativeModule(moduleFile)) {
      const modulePath = path.join(fileDir, moduleFile);
      files.push(require.resolve(modulePath));
    }
  }

  return files;
}

module.exports = {
  makeDir,
  watchFile,
  writeFile,
  removeFile,
  resolveFile,
  isNativeModule,
};
