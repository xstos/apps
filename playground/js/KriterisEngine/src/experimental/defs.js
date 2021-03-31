import fs from 'fs'

const path = `./src/experimental/defs.txt`
const outPath = './src/funcdefs.js'
const source = fs.readFileSync(path, 'utf8') // sourceText
if (fs.existsSync(outPath)) {
  fs.unlinkSync(outPath)
}
const ast = eval(source)

const interfaces = ast.body.filter(
  (node) => node.type === 'TSInterfaceDeclaration'
)

const modules = interfaces.map((node) => {
  const methods = node.body.body
    .map((item) => {
      if (item.type !== 'TSMethodSignature') return null
      const methodName = item.key.name
      const params = item.params.map((p) => {
        return { name: p.name, type: p.typeAnnotation.typeAnnotation.type }
      })
      return { methodName, params }
    })
    .filter((o) => o !== null)
  return {
    name: node.id.name,
    methods,
  }
})
const lines = []
modules.map((mod) => {
  const { name, methods } = mod
  methods.map((method) => {
    //console.log(JSON.stringify(method))
    const { params } = method
    lines.push(`// ${name} ${method.methodName}`)
    if (params.length < 2) {

    }
    return null
  })

  return null
})

fs.writeFileSync(outPath, lines.join('\n'))
function getCircularReplacer() {
  const seen = new WeakSet()
  return function (key, value) {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return
      }
      seen.add(value)
    }
    return value
  }
}

const json = JSON.stringify(modules, getCircularReplacer(), 2)
console.log(lines)
//console.log(json)
