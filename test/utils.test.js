const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
const assert = require('assert');
const utils = require('../src/utils');

function resolveTest(dir) {
  return path.join(__dirname, '../test', dir);
}

describe('utils', () => {
  describe('resolveApp', () => {
    it('should return a path relative to app', () => {
      assert.equal(utils.resolveApp('./test'), resolveTest('../node_modules/mocha/test'));
    });
  });

  describe('resolveModule', () => {
    it('should return a path relative to module', () => {
      assert.equal(utils.resolveModule('./test'), resolveTest('.'));
    });
  });

  describe('isConfigChanged', () => {
    const oldPages = [{
      path: '/test/a',
    }, {
      path: '/test/b',
    }];
    const pageA = {
      path: '/test/a',
    };
    const pageB = {
      path: '/test/b',
      config: {
        enablePullDownRefresh: true,
      },
    };
    it('should return false when the config is present', () => {
      assert.equal(utils.isConfigChanged(pageA, oldPages), false);
    });
    it('should return true when the config is not present', () => {
      assert.equal(utils.isConfigChanged(pageB, oldPages), true);
    });
  });

  describe('genEntry', () => {
    const paths = {
      pages: resolveTest('./assets/pages.js'),
      template: resolveTest('./assets/main.js'),
      dist: resolveTest('../dist'),
      entry: resolveTest('./temp'),
      bakPages: resolveTest('./temp/pages.bak.js'),
      bakTemplate: resolveTest('./temp/template.bak.js'),
    };
    const options = {
      cache: true,
    };
    it('should return entry object', () => {
      const tempPath = resolveTest('./temp');
      if (!fs.existsSync(tempPath)) fs.mkdirSync(tempPath);
      const entry = utils.genEntry(paths, options);
      assert.equal(entry.app, resolveTest('./assets/main.js'));
      assert.equal(entry['pages/a'], resolveTest('./temp/pageA.js'));
    });
    it('should return entry object directly', () => {
      const entry = utils.genEntry(paths, options);
      assert.equal(entry.app, resolveTest('./assets/main.js'));
      assert.equal(entry['pages/b'], resolveTest('./temp/pageB.js'));
      rimraf(resolveTest('./temp'), (err) => {
        if (err) throw err;
      });
    });
  });
});
