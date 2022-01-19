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
auto({ foo: 'hello', bar: 'world' }).map((pair, index)=>pair)
auto(1,2,3).map(i=>i+1) //2,3,4
auto('a','b','c').map(c=>c+1 ) //['a1', 'b1', 'c1']
auto("hello\nthere").split('\n')
auto(1,2,3).concat(4,5,6)


var docCookiesExample = new Proxy(()=>{}, {
    apply: function(target, thisProxy, argumentsList) {
        return thisProxy
    },
    get: function (oTarget, sKey) {
        return oTarget[sKey] || oTarget.getItem(sKey) || undefined;
    },
    set: function (oTarget, sKey, vValue) {
        if (sKey in oTarget) { return false; }
        return oTarget.setItem(sKey, vValue);
    },
    deleteProperty: function (oTarget, sKey) {
        if (!sKey in oTarget) { return false; }
        return oTarget.removeItem(sKey);
    },
    enumerate: function (oTarget, sKey) {
        return oTarget.keys();
    },
    ownKeys: function (oTarget, sKey) {
        return oTarget.keys();
    },
    has: function (oTarget, sKey) {
        return sKey in oTarget || oTarget.hasItem(sKey);
    },
    defineProperty: function (oTarget, sKey, oDesc) {
        if (oDesc && 'value' in oDesc) { oTarget.setItem(sKey, oDesc.value); }
        return oTarget;
    },
    getOwnPropertyDescriptor: function (oTarget, sKey) {
        var vValue = oTarget.getItem(sKey);
        return vValue ? {
            value: vValue,
            writable: true,
            enumerable: true,
            configurable: false
        } : undefined;
    },
});