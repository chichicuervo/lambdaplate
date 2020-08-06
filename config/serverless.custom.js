const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')

const loadFile = (file, file_root = '.') => {
    try {
        if (!file.match(/\.yml$/)) {
            throw new Error ('Invalid YAML File for Custom Config')
        }

        const file_path = path.resolve(file_root, file)

        return yaml.safeLoad(fs.readFileSync(file_path, 'utf8'))
    } catch (err) {
        console.error(err)
    }
}

const custom = () => {
    const file_root = path.resolve(__dirname, 'serverless.custom')
    const files = fs.readdirSync(file_root).filter(file => file.match(/\.yml$/))

    return files
        .map(file => loadFile(file, file_root))
        .reduce((a,c) => ({ ...a, ...c }))
}

module.exports = new Proxy({}, {
    get: (_, param) => {
        return (param == 'default' || !param)
            ? custom()
            : loadFile(param)
    }
})
