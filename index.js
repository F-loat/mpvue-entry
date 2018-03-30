const fs = require('fs')
const path = require('path')
const babel = require('babel-core')

function resolveApp (dir) {
  return path.join(path.dirname(require.main.filename), '..', dir)
}

function resolveModule (dir) {
  return path.join(__dirname, dir)
}

function transformCode (str) {
  const babelrc = resolveApp('./.babelrc')
  return babel.transform(str, { extends: babelrc }).code
}

function genEntry (config_file) {
  const pages = require(config_file)

  const entry = {
    app: resolveApp('./src/main.js')
  }

  const template = transformCode(String(fs.readFileSync(entry.app)))

  template.match(/export default ?({[^]*})/)

  pages.forEach((page) => {
    const entryFile = resolveModule(`./${page.name}.js`)

    const config = JSON.stringify(page.wx || {})
    fs.writeFileSync(entryFile, template.replace(RegExp.$1, config))

    entry[page.path] = entryFile
  })

  return entry
}

module.exports = genEntry
