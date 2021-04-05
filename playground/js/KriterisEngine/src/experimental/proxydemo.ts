import * as R from 'ramda'

export function pipe(...xs) {
  const byType = R.groupBy((item) => item?.type || typeof item)(xs)
}

const handler = {
  construct(target, args) {
    return {}
  },
  get(target, prop, receiver) {
    if (prop === "foo") {
      debugger
    }
  },
  set(obj, prop, value) {
    debugger
    return true
  },
  apply: function(target, thisArg, argumentsList) {

    return this;
  }
}

function _o() {
  return new Proxy(()=>{}, handler)
}

export const o = _o()

o.foo =2
