const path = require('path');
const assert = require('assert');
const genEntry = require('../lib/compiler');
const { Template } = require('../lib/parser');
const { resolveApp, resolveModule } = require('../lib/utils/resolve');
const { removeFile, resolveFile } = require('../lib/utils/file');

function resolveTest(dir) {
  return path.join(__dirname, '../test', dir);
}

describe('utils', () => {
  describe('resolveApp', () => {
    it('should return a path relative to app', () => {
      assert.equal(resolveApp('./test'), resolveTest('../node_modules/mocha/test'));
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

  describe('template', () => {
    it('should return template string', () => {
      const template = new Template();
      template.refresh({ template: resolveTest('./assets/main.js') });
      assert.equal(template.content, `import Vue from 'vue';
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
      entry: resolveTest('./'),
    };
    it('should return entry object', () => {
      genEntry(paths, 'initial').then((entry) => {
        assert.equal(entry.app, resolveTest('./assets/main.js'));
        assert.equal(entry['pages/a'], resolveTest('./pagesA.js'));
        removeFile([entry['pages/a'], entry['pages/b']]);
      });
      genEntry(paths, 'pages');
    });
  });
});
