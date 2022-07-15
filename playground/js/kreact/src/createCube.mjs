/*
const testObj = {
  a: {
    a1: {

    }
  }
}
const obs = observe(testObj, {
  bubble: true,
  deep: true
})

obs.__handler = (keys, value, oldValue, observedObject) => {
  console.log({keys,value,oldValue, observedObject})
}

obs.a.a1.foo=true
*/
const [node,cursor,ref,arrow,f_concat,tag]=[0,1,2,3,4,5,6]
//node,[arrows],...children
//ref,node_index,...tags
const items = [
    [node,[],3,4,5],
    [cursor],
    [node,[] ], //a
    [ref,2], //node_a
    [ref,3], //4
    [ref,1], //cursor=5
    [f_concat,2,7], //6
    [node], //7
]
//https://youtu.be/gT6il5fJyAs?t=2053
const example_handler = {
    apply(target, thisArg, argumentsList) {
      return target(...argumentsList)
    },
    get(target, key) {
        return target[key]
    },
    set(target, key, value) {
        return target[key] = value
    },
    deleteProperty(target, key) {
        return delete target[key]
    },
    ownKeys(target) {
        return Object.keys(target)
    },
    has(target, key) {
        return key in target
    },
    defineProperty(target, key, descriptor) {
        return Object.defineProperty(target, key, descriptor)
    },
    getOwnPropertyDescriptor(target, key) {
        return Object.getOwnPropertyDescriptor(target, key)
    }
}
/*
  const docCookies = ... get the "docCookies" object here:
  https://reference.codeproject.com/dom/document/cookie/simple_document.cookie_framework
*/

function createCube() {
    const map=new Map()
    let count=0
    let dimensionsHandler=null
    function newDimProxy(state) {
        return new Proxy(state, dimensionsHandler)
    }
    function getOrCreateKey(key) {
        let ret = count
        if (!map.has(key)) {
            map.set(key,ret)
            map.set(ret,key)
            count++
        } else {
            ret = map.get(key)
        }
        return [key,ret]
    }

    dimensionsHandler = {
        get(target, key) {
            const dimensionsPair=getOrCreateKey(key)
            target.arr.push(dimensionsPair)
            console.log(target.arr)

            return newDimProxy(target)
        },
        apply(target, thisArg, argumentsList) {
            return
        },
    }

    let ret = {}
    Object.defineProperty(ret, 'dimensions', {
        get: () => {
            const derp = ()=>{}
            derp.arr = []
            return newDimProxy(derp);
        },
    });
    return ret

}

const cube = createCube()

Object.defineProperty(global, 'd', {
    get: () => cube.dimensions,
});

//const d = cube.dimensions

const xyz = d.x.y.z
xyz(0,0,0)

/*

match
<space> ''
<newline> ''


 */