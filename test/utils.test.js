const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
const assert = require('assert');
const utils = require('../lib/utils');

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

  describe('genEntry', () => {
    const paths = {
      pages: resolveTest('./assets/pages.js'),
      template: resolveTest('./assets/main.js'),
      dist: resolveTest('../dist'),
      entry: resolveTest('./temp'),
      bakPages: resolveTest('./temp/pages.bak.json'),
      bakTemplate: resolveTest('./temp/template.bak.js'),
    };
    const options = {
      watch: false,
    };
    it('should return entry object', () => {
      const tempPath = resolveTest('./temp');
      if (!fs.existsSync(tempPath)) fs.mkdirSync(tempPath);
      const entry = utils.genEntry(paths);
      assert.equal(entry.app, resolveTest('./assets/main.js'));
      assert.equal(entry['pages/a'], resolveTest('./temp/pageA.js'));
    });
    it('should return entry object directly', () => {
      const entry = utils.genEntry(paths);
      assert.equal(entry.app, resolveTest('./assets/main.js'));
      assert.equal(entry['pages/b'], resolveTest('./temp/pageB.js'));
      rimraf(resolveTest('./temp'), (err) => {
        if (err) throw err;
      });
    });
  });
});
