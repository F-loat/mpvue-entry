const path = require('path');

class Pages {
  constructor() {
    this.origin = [];
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
    const pages = require(paths.pages);

    const changedPages = [];
    const invalidPages = [];

    const formatedPages = pages
      .map((page) => {
        const newPage = typeof page === 'string' ? { path: page } : page;
        const entryName = newPage.path.replace(/\/(\w)/g, (match, $1) => $1.toUpperCase());
        newPage.path = newPage.path.replace(/^\//, '');
        newPage.entry = path.join(paths.entry, `${entryName}.js`);
        return newPage;
      })
      .sort((pageA, pageB) => pageA.path > pageB.path);

    const existedPages = formatedPages
      .filter((page) => {
        const isNew = this.current.findIndex(oldPage => oldPage.path === page.path) === -1;
        if (isNew) changedPages.push(page);
        return !isNew;
      });

    const validPages = this.current
      .filter((page) => {
        const isInvalid = formatedPages.findIndex(newPage => newPage.path === page.path) === -1;
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

    this.origin = pages;
    this.normal = formatedPages.filter(page => !page.native);
    this.current = formatedPages;
    this.changed = changedPages;
    this.invalid = invalidPages;
  }
}

module.exports = Pages;
