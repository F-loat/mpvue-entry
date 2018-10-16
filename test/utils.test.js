const path = require('path');
const assert = require('assert');
const { genEntry } = require('../lib/compiler');
const { parseTemplate, parsePages } = require('../lib/parser');
const { resolveApp, resolveModule } = require('../lib/utils/resolve');
const { removeFile, resolveFile, isNativeModule } = require('../lib/utils/file');

function resolveTest(dir) {
  return path.join(__dirname, '../test', dir);
}

describe('utils', () => {
  describe('resolveApp', () => {
    it('should return a path relative to app', () => {
      assert.equal(resolveApp('./test'), resolveTest('.'));
    });
  });

  describe('resolveModule', () => {
    it('should return a path relative to module', () => {
      assert.equal(resolveModule('./test'), resolveTest('.'));
    });
  });

  describe('resolveFile', () => {
    it('should return a file list', () => {
      const filePath = resolveTest('./assets/pages.js');
      const fileList = resolveFile(filePath);
      assert.equal(fileList.length, 3);
      assert.equal(fileList[0], filePath);
      assert.equal(fileList[1], resolveTest('./assets/a.js'));
      assert.equal(fileList[2], resolveTest('./assets/b.js'));
    });
  });

  describe('isNativeModule', () => {
    it('should return true', () => {
      assert.equal(true, isNativeModule('fs'));
      assert.equal(true, isNativeModule('path'));
    });
    it('should return false', () => {
      assert.equal(false, isNativeModule('react'));
      assert.equal(false, isNativeModule('vue'));
    });
  });

  describe('template', () => {
    it('should return template string', () => {
      const template = parseTemplate({ template: resolveTest('./assets/main.js') });
      assert.equal(template, `import Vue from 'vue';
import store from '@/store';
import App from '@/App';

Vue.config.productionTip = false;

const app = new Vue({
  store,
  ...App,
});
app.$mount();

export default {
  config: {
    pages: [
      '^pages/b',
    ],
    window: {
      backgroundTextStyle: 'light',
    },
  },
};
`);
    });
  });

  describe('genEntry', () => {
    const paths = {
      pages: resolveTest('./assets/pages.js'),
      main: resolveTest('./assets/main.js'),
      template: resolveTest('./assets/main.js'),
      app: resolveTest('./assets/app.json'),
      dist: resolveTest('./assets'),
      entry: resolveTest('./'),
    };
    it('should return entry object', () => {
      const template = parseTemplate(paths);
      const pages = parsePages(paths);
      genEntry(paths, pages, template).then((entry) => {
        assert.equal(entry.app, resolveTest('./assets/main.js'));
        assert.equal(entry['pages/a'], resolveTest('./pagesA.js'));
        removeFile([entry['pages/a'], entry['pages/b']]);
      });
    });
  });
});
