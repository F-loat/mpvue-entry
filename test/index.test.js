const assert = require('assert');
const MpvueEntry = require('../lib');

describe('index', () => {
  describe('getEntry', () => {
    const paths = {
      pages: '../../test/assets/pages.js',
      template: '../../test/assets/main.js',
      app: '../../test/dist/app.json',
      entry: '../../test',
    };
    it('should return entry function', () => {
      const entry = MpvueEntry.getEntry(paths);
      assert.equal(typeof entry, 'function');
    });
  });
});
