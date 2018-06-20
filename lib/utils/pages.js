const path = require('path');

class Pages {
  constructor() {
    this.normal = [];
    this.current = [];
    this.changed = [];
    this.invalid = [];
  }

  /**
   * @param {Object} paths
   * @param {String} paths.pages
   * @param {String} paths.entry
   */
  refresh(paths) {
    require.cache[paths.pages] = null;
    const pages = require(paths.pages)
      .map((page) => {
        const newPage = typeof page === 'string' ? { path: page } : page;
        newPage.path = newPage.path.replace(/^\//, '');
        newPage.name = newPage.name || newPage.path.replace(/\/(\w)/g, (match, $1) => $1.toUpperCase());
        newPage.entry = path.join(paths.entry, `${newPage.name}.js`);
        return newPage;
      })
      .sort((pageA, pageB) => pageA.path > pageB.path);

    const changedPages = [];
    const invalidPages = [];

    const existedPages = pages.filter((page) => {
      const isNew = this.current.findIndex(oldPage => oldPage.path === page.path) === -1;
      if (isNew) changedPages.push(page);
      return !isNew;
    });

    const validPages = this.current.filter((page) => {
      const isInvalid = pages.findIndex(newPage => newPage.path === page.path) === -1;
      if (isInvalid) invalidPages.push(page);
      return !isInvalid;
    });

    existedPages.forEach((page, index) => {
      const oldPage = validPages[index] || {};

      const keys = Object.keys(page.config || {});
      const oldKeys = Object.keys(oldPage.config || {});

      if (keys.length !== oldKeys.length ||
        keys.some(key => page.config[key] !== oldPage.config[key])) {
        changedPages.push(page);
      }
    });

    this.normal = pages.filter(page => !page.native);
    this.current = pages;
    this.changed = changedPages;
    this.invalid = invalidPages;
  }
}

module.exports = Pages;
