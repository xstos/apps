const proxyJs = {
  array: {
    push(...args) {
      const clone = [...this]
      clone.push(...args)
      return clone
    },
  },
  number: {
    divide(...args) {
      return this / args.reduce((acc, item) => acc * item)
    },
  },
}
function log(...o) {
  console.log(...o)
  return o
}
const handler = {
  get(target, name, proxy) {
    target.stack.push(log({ get: name }))
    return proxy
  },
  set(target, prop, value, proxy) {
    return true
  },
  apply(target, proxy, argumentsList) {

    target.stack.push(log({ apply: argumentsList }))
    return proxy
  },
}

function p(value) {
  const target = () => {}

  target.value = value
  target.stack = []
  log('.')
  log(value)
  const ret = new Proxy(target, handler)
  return ret
}

p([1, 2, 3]).push(4)

p(`
 hello (1)
  goodbye (2)
 derp (3)

`)
  .trim()
  .split('\r\n')
  .map()
  .trim()
  .replace()
  .do((i) => `(${i + 1})`)
  .spread(p().get('fruits'))
