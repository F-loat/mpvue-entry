const path = require('path');

class Pages {
  constructor() {
    this.normal = [];
    this.current = [];
    this.changed = [];
    this.outdated = [];
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
    const oldPages = this.current.concat();
    const changedPages = [];
    const outdatedPages = [];

    oldPages.forEach((oldPage) => {
      const index = pages.findIndex(page => page.path === oldPage.path);
      if (index !== -1) return;
      const outPage = oldPages.splice(index, 1);
      outdatedPages.push(outPage[0]);
    });

    pages.forEach((page, index) => {
      const oldPage = oldPages[index] || {};

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
    this.outdated = outdatedPages;
  }
}

module.exports = Pages;
