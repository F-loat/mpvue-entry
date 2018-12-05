const assert = require('assert');
const MpvueEntry = require('../lib');

describe('index', () => {
  describe('getEntry', () => {
    const paths = {
      config: './test/assets/config.js',
      main: './test/assets/main.js',
      entry: './test/dist',
    };
    it('should return entry function', () => {
      const entry = MpvueEntry.getEntry(paths);
      assert.equal(typeof entry, 'function');
    });
  });
});
