const fs = require('fs');

// 文件监听函数
function watchFile(files, cb) {
  [].concat(files).forEach((file) => {
    let timer;
    fs.watch(file, () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(cb, 50);
    });
  });
}

// 文件写入函数
function writeFile(file, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(file, data, (err) => {
      if (err) reject(err);
      resolve();
    });
  });
}

// 文件移除函数
function removeFile(files) {
  [].concat(files).forEach((file) => {
    if (fs.existsSync(file)) fs.unlinkSync(file);
  });
}

module.exports = {
  watchFile,
  writeFile,
  removeFile,
};
