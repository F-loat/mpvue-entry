const fs = require('fs')
const path = require('path')

function resolveApp (dir) {
  return path.join(path.dirname(require.main.filename), '..', dir)
}

function resolveModule (dir) {
  return path.join(__dirname, dir)
}

function genEntry (config_file) {
  const pages = path.isAbsolute(config_file) ?
    require(config_file) : require(resolveApp(config_file))

  const entry = {
    app: resolveApp('./src/main.js')
  }

  const template = String(fs.readFileSync(entry.app)).replace(/App.mpType.*/, '')

  pages.forEach((page) => {
    const { name, path, config } = page

    const fileName = name || path.replace(/\/(\w)/g, ($0, $1) => $1.toUpperCase())
    const entryPath = resolveModule(`./${fileName}.js`)
    const realPath = path.replace(/^\//, '')

    fs.writeFileSync(entryPath, template
      .replace(/import App from .*/, `import App from '@/${realPath}'`)
      .replace(/export default ?{[^]*}/, `export default ${JSON.stringify({ config })}`))

    entry[realPath] = entryPath
  })

  return entry
}

module.exports = genEntry
