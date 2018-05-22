/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Naoyuki Kanezawa @nkzawa
*/

const MultiEntryDependency = require('webpack/lib/dependencies/MultiEntryDependency');
const SingleEntryDependency = require('webpack/lib/dependencies/SingleEntryDependency');
const MultiModuleFactory = require('webpack/lib/MultiModuleFactory');
const MultiEntryPlugin = require('webpack/lib/MultiEntryPlugin');
const SingleEntryPlugin = require('webpack/lib/SingleEntryPlugin');

function itemToPlugin(context, item, name) {
  if (Array.isArray(item)) {
    return new MultiEntryPlugin(context, item, name);
  }
  return new SingleEntryPlugin(context, item, name);
}

class DynamicEntryPlugin {
  constructor(context, entry) {
    this.context = context;
    this.entry = entry;
  }

  apply(compiler) {
    compiler.plugin('compilation', (compilation, params) => {
      const multiModuleFactory = new MultiModuleFactory();
      const { normalModuleFactory } = params;

      compilation.dependencyFactories.set(MultiEntryDependency, multiModuleFactory);
      compilation.dependencyFactories.set(SingleEntryDependency, normalModuleFactory);
    });

    compiler.plugin('make', (compilation, callback) => {
      const addEntry = (entry, name) => {
        const dep = DynamicEntryPlugin.createDependency(entry, name);
        return new Promise((resolve, reject) => {
          compilation.addEntry(this.context, dep, name, (err) => {
            if (err) return reject(err);
            resolve();
          });
        });
      };

      Promise.resolve(this.entry()).then((entry) => {
        Object.assign(compiler.options, { entry });
        if (typeof entry === 'string' || Array.isArray(entry)) {
          addEntry(entry, 'main').then(() => callback(), callback);
        } else if (typeof entry === 'object') {
          Promise.all(Object.keys(entry)
            .map(name => addEntry(entry[name], name)))
            .then(() => callback(), callback);
        }
      });
    });
  }
}

DynamicEntryPlugin.createDependency = (entry, name) => {
  if (Array.isArray(entry)) { return MultiEntryPlugin.createDependency(entry, name); }
  return SingleEntryPlugin.createDependency(entry, name);
};

module.exports = {
  itemToPlugin,
  DynamicEntryPlugin,
};
