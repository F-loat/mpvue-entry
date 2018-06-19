const fs = require('fs');

class Template {
  constructor() {
    this.content = '';
  }

  /**
   * @param {Object} path
   */
  refresh(path) {
    const mixinReg = /Vue\.mixin\((.*)\).*/;
    let template = fs.readFileSync(path).toString()
      .replace(/.*mpType.*/, '')
      .replace(/.*app-only-begin[^]*?app-only-end.*/g, '')
      .replace(/.*app-only.*/g, '');
    while (mixinReg.test(template)) {
      console.log(RegExp.$1)
      template = template.replace(mixinReg, '')
        .replace(new RegExp(`import ${RegExp.$1 || null}.*\n`), '');
    }
    this.content = template.replace(/[\r?\n]{2,}/g, '\n\n');
  }
}

module.exports = Template;
