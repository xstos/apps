import * as R from 'ramda'


const handler = {
  construct(target, args) {
    return {}
  },
  get(target, prop, receiver) {
    if (prop === 'foo') {
      debugger
    }
  },
  set(obj, prop, value) {
    debugger
    return true
  },
  apply(target, thisArg, argumentsList) {
    return this
  },
}

function _o() {
  return new Proxy(() => {}, handler)
}

export const o = _o()

