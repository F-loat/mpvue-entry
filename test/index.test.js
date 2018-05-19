const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
const assert = require('assert');
const getEntry = require('../src');

function resolveTest(dir) {
  return path.join(__dirname, '../test', dir);
}

describe('index', () => {
  describe('getEntry', () => {
    const paths = {
      pages: '../../test/assets/pages.js',
      template: '../../test/assets/main.js',
      dist: '../../test/dist',
      entry: '../../test/temp',
      bakPages: '../../test/temp/pages.bak.js',
      bakTemplate: '../../test/temp/template.bak.js',
    };
    const options = {
      cache: true,
      watch: false,
    };
    it('should return entry object', () => {
      const tempPath = resolveTest('./temp');
      if (!fs.existsSync(tempPath)) fs.mkdirSync(tempPath);
      const entry = getEntry(paths, options);
      assert.equal(entry['app'], resolveTest('./assets/main.js'));
      assert.equal(entry['pages/a'], resolveTest('./temp/pageA.js'));
      rimraf(tempPath, (err) => {
        if (err) console.log(err);
      });
    });
  });
});
