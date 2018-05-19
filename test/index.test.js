const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
const assert = require('assert');
const MpvueEntry = require('../src');

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
    it('should return entry function', () => {
      const tempPath = resolveTest('./temp');
      if (!fs.existsSync(tempPath)) fs.mkdirSync(tempPath);
      const entry = MpvueEntry.getEntry(paths, options);
      assert.equal(typeof entry, 'function');
      rimraf(tempPath, (err) => {
        if (err) console.log(err);
      });
    });
  });
});
