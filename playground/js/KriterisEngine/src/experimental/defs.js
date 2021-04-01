import fs from 'fs'

const path = `./src/experimental/defs.txt`
const outPath = './src/experimental/funcdefs.ts'
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
    //lines.push(`// ${name} ${method.methodName}`)
    const str = 'name === undefined'
    if (name.endsWith('Constructor')) return null
    switch (name) {
      case 'ReadonlyArray':
        return null
      case 'CallableFunction':
        return null
      case 'NewableFunction':
        return null
      case 'ConcatArray':
        return null
      case 'PromiseLike':
        return null
      case 'PropertyDescriptor':
        return null
    }
    const proto = `${name}.prototype!==undefined`
    const hasProto = eval(proto)
    if (params.length === 0) {
      const line = `${name.toLowerCase()}_${method.methodName}: ${name}${
        hasProto ? '.prototype' : ''
      }.${method.methodName},`
      lines.push(line)
    }
    return null
  })

  return null
})
const ffObj = `({
${lines.join('\r\n')}
})`
const foo = [`export const ff = (`, ffObj].join('\r\n')
console.log(foo)
fs.writeFileSync(outPath, foo)
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

const ff = eval(ffObj)
const o = ff.string_trim.call('   yo    ')
console.log(o)
//
//const json = JSON.stringify(modules, getCircularReplacer(), 2)

//console.log(json)
