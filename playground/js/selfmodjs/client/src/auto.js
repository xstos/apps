import { stringify } from 'javascript-stringify'
const TBoolean = Boolean.constructor
const TNumber = Number.constructor
const TDate = Date.constructor
const TString = String.constructor
const TArray = Array.constructor
const TObject = Object.constructor
const TFunction = Function.constructor
const TUndefined = { constructor() {return undefined } }
const TNull = { constructor() {return null } }

function getType(o) {
    if (o===undefined) return TUndefined
    if (o===null) return TNull
    return o.constructor
}

const state = {
    root: [

    ]
}

function auto(...args) {
    let nextOp = ''

    const currentPipeIndex = state.root.length
    const currentPipe = [args]
    state.root.push(currentPipe)


    const handler = {
        get: function(target, prop, thisProxy) {
            nextOp = prop
            return thisProxy;
        },
        apply: function(target, thisProxy, argumentsList) {



            eval(currentValue,nextOp, argumentsList)
            return thisProxy
        }
    }
    return new Proxy(()=>{},handler)
}

function eval(currentValue, op, args) {
    const type =getType(currentValue)
    switch (type) {
        case TObject:
            switch (op) {
                case 'map':

                    const keys = Object.keys(currentValue)
                    const l = keys.length
                    for (let i = 0; i < l; i++) {

                    }
                    break;
            }
            break;
    }
}
auto({ foo: 'hello', bar: 'world' }).map((key, index)=>key)
auto(1,2,3).map(i=>i+1) //2,3,4
auto('a','b','c').map(c=>c+1 ) //['a1', 'b1', 'c1']
auto("hello\nthere").split('\n')
auto(1,2,3).concat(4,5,6)

