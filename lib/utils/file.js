const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const chalk = require('chalk');

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
    let timer;
    fs.watch(file, () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => callback(file), 50);
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
    const modulePath = path.join(fileDir, RegExp.$1);
    try {
      files.push(require.resolve(modulePath));
    } catch (err) {
      console.log(chalk.yellow(
        '[Module Resolve Warning]: ',
        RegExp.$1,
        'not found in ',
        fileDir,
      ));
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
};
