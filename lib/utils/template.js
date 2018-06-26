const fs = require('fs');
const path = require('path');

class Template {
  constructor() {
    this.home = '';
    this.content = '';
  }

  /**
   * @param {Object} paths
   * @param {String} paths.template
   */
  refresh(paths) {
    const mixinReg = /Vue\.mixin\((.*)\).*/;
    const homeReg = /pages:[^]*?\^(.*?)['|"]/;
    const relativeReg = /import .* from ['|"](\..*)['|"]/;
    let template = fs.readFileSync(paths.template).toString()
      .replace(/.*mpType.*/, '')
      .replace(/.*app-only-begin[^]*?app-only-end.*/g, '')
      .replace(/.*app-only.*/g, '')
      .replace(/\/\/.*/g, '')
      .replace(/\/\*[^]*?\*\//g, '');
    while (mixinReg.test(template)) {
      template = template.replace(mixinReg, '')
        .replace(new RegExp(`import ${RegExp.$1 || null}.*\n`), '');
    }
    while (relativeReg.test(template)) {
      template = template.replace(relativeReg, (match, $1) => {
        const templateDir = path.dirname(paths.template);
        const absolutePath = path.join(templateDir, $1).replace(/\\/g, '\\\\');
        return match.replace($1, absolutePath);
      });
    }
    this.home = homeReg.test(template) ? RegExp.$1 : '';
    this.content = template.replace(/[\r?\n]{2,}/g, '\n\n');
  }
}

module.exports = Template;
