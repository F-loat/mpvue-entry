const path = require('path');
const assert = require('assert');
const { resolveApp, resolveModule } = require('../lib/utils/resolve');
const { genEntry } = require('../lib/utils/compiler');
const { removeFile } = require('../lib/utils/file');

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

  describe('genEntry', () => {
    const paths = {
      pages: resolveTest('./assets/pages.js'),
      template: resolveTest('./assets/main.js'),
      app: resolveTest('../dist/app.json'),
      entry: resolveTest('./'),
    };
    it('should return entry object', () => {
      genEntry(paths, 'initial').then((entry) => {
        assert.equal(entry.app, resolveTest('./assets/main.js'));
        assert.equal(entry['pages/a'], resolveTest('./pagesA.js'));
        removeFile([entry['pages/a'], entry['pages/b']]);
      });
    });
  });
});
