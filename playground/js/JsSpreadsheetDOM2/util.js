function log(...items) {
    console.log(...items)
    return
}
function logj(...items) {
    log(...items.map(i=>JSON.stringify(i,null,2)))
}
function lastItem(arr) {
    return arr[arr.length-1]
}

function makeProxy() {
    const f = ()=>{}
    const dom = { type: 'body', props: {}, children: []}
    let get = myget
    let set = myset
    let apply = myapply
    let domProxy = null
    const path = []
    function myget(target, prop, receiver) {
        return domProxy
    }
    function myset(target, key, value) {
        let o = dom
        path.forEach((i)=>{
            let el=o.children[i]
            if (!el) {
                el={ type: '', props: {}, children: [] }
                o.children[i]=el
            }
            o=el
        })
        return true
    }
    function myapply(target, thisArg, argumentsList) {
        return domProxy
    }
    domProxy = new Proxy(f,{
        get(target, prop, receiver) {
            path.push(prop)
            return get(target,prop,receiver)
        },
        set(target, key, value) {
            return set(target,key,value)
        },
        apply(target, thisArg, argumentsList) {
            return apply(target,thisArg,argumentsList)
        },
    })
    return domProxy
}
//noop proxy
function noop() {
    return new Proxy(()=>{}, {
        get(target, p, receiver) {
            return receiver
        },
        apply(target, thisArg, argArray) {
            return thisArg
        }
    })

}
//safe proxy
function safe(o) {
    return new Proxy(o,{
        get(target, property, receiver) {
            if (property in target) {
                const value = target[property];
                if (typeof value === 'object' && value !== null) {
                    // If the property is an object, create a safe proxy for it
                    return safe(value);
                } else if (typeof value === 'function') {
                    // If the property is a function, return it
                    return value.bind(target);
                } else {
                    // Return primitive values as is
                    return value;
                }
            } else {
                // Handle missing properties gracefully with a no-op
                return noop();
            }
        },
        apply(target, thisArg, argumentsList) {
            if (typeof target === 'function') {
                // Check if the target is a function and call it
                return target.apply(thisArg, argumentsList);
            } else {
                // Handle invalid function calls gracefully with a no-op
                return noop();
            }
        }
    })
}

function observerProxy(emit, path) {
    path=path||[]
    return new Proxy(()=>{},{
        get(target, key, thisArg) {
            emit('get', [...path, key])
            return observerProxy(emit, [...path, key])
        },
        set(target, key, value) {
            emit('set', [...path, key], value)
            return value
        },
        apply(target, thisArg, argumentsList) {
            return emit('apply', [...path], argumentsList)
        },
    })

}
function observerProxyExample() {
    const p = observerProxy(log)
    p.a.b(1)
    p.c.d=2
}
//observerProxyExample()

function createPaths(array, callback) {
    let currentPath = [], parentPath=[];

    for (let i = 0; i < array.length; i++) {
        parentPath = [...currentPath]
        if (i === 0) {
            currentPath[0]=array[i]
        } else {
            currentPath.push(array[i])
        }
        callback(currentPath, parentPath)
    }
}
//log(createPaths(['a','b','c'],log))
function getAttributes(el) {
    const ret= Object.fromEntries(el.getAttributeNames().map(k=>[k,el.getAttribute(k)]))
    return ret
}

function singleton(fun) {
    if (Reflect.has(fun,'_value')) {
        return fun._value
    }
    fun._value=fun()
    return fun._value
}

function resizeObserver(el, callback) {
    //https://developer.mozilla.org/en-US/docs/Web/API/Resize_Observer_API
    //log('observing size',el)
    const ro = new ResizeObserver((entries) => {
        for (const entry of entries) {
            const {width, height, x, y, left, top, bottom, right} = entry.contentRect
            //log('size changed',entry.target, width,height)
            callback({target: entry.target, width, height, x, y, left, top, bottom, right})
        }
    });

    ro.observe(el);
    return () => ro.unobserve(el)
}

function insertAfter(el, newNode) {
    el.parentNode.insertBefore(newNode, el.nextSibling);
}
function makeEl(tag) {
    return document.createElement(tag)
}

function elById(id, found, missing) {
    const el = document.getElementById(id)
    if (el) {
        found && found(el)
    } else {
        missing && missing()
    }
    return el
}
function elByAttr(name,value) {
    const el=document.querySelector(`[${name}="${value}"]`)

    return el
}

function moveDown(el) {
    const targetElement = el;
    const nextSibling = targetElement.nextElementSibling;

    if (targetElement && nextSibling) {
        targetElement.remove();
        nextSibling.parentNode.insertBefore(targetElement, nextSibling.nextSibling);
    }
}
function moveUp(el) {
    const targetElement = el;
    const sibling = targetElement.previousElementSibling;

    if (targetElement && sibling) {
        targetElement.remove();
        sibling.parentNode.insertBefore(targetElement, sibling);
    }
}
function rng(start, end) {
    let ret=[]
    for (let i = start; i <= end; i++) {
        ret.push(i)
    }
    return ret
}
function insertNodeAtCursor(el) {
    const selection = document.getSelection();
    const range = document.createRange();
    if (!range.collapsed) return
    selection.getRangeAt(0).insertNode(el);
    selection.collapseToEnd()
}
function frag(arrowFunc) {
    const frag = document.createDocumentFragment()
    arrowFunc(frag)
    return frag
}
function htmlMount(strings,...expSlots) {
    return frag(html(strings,...expSlots))
}
function getKey(event) {
    const key = event.key.toLowerCase()
    if (key==="control" || key==="alt" || key==="shift") return key
    const mod = [
        event.ctrlKey && "ctrl",
        event.altKey && "alt",
        event.shiftKey && "shift"]
        .filter(v=>v)

    const foo = [...mod, key].join("+")
    return foo
}
let ids = {
    ['']: 1
}
function getId(name) {
    if (arguments.length<1) name=''
    let ret
    if (Reflect.has(ids,name)) {
        ret = ids[name]
        ids[name] = ret+1;
        return ret
    }
    ret = 0
    ids[name]=ret
    return ret
}
function iter(next, target) {
    target = target || {}
    target[Symbol.iterator] = function() {
        return {
            next
        }
    }
    return target
}
function divmod(x,y) {
    const mod = x%y
    const div = (x-mod)/y
    return [div,mod]
}

/*!
 * is-plain-object <https://github.com/jonschlinkert/is-plain-object>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */

function isObject(o) {
    return Object.prototype.toString.call(o) === '[object Object]';
}

function isPlainObject(o) {
    var ctor,prot;

    if (isObject(o) === false) return false;

    // If has modified constructor
    ctor = o.constructor;
    if (ctor === undefined) return true;

    // If has modified prototype
    prot = ctor.prototype;
    if (isObject(prot) === false) return false;

    // If constructor does not have an Object-specific method
    if (prot.hasOwnProperty('isPrototypeOf') === false) {
        return false;
    }

    // Most likely a plain Object
    return true;
};
function isPrimitive(arg) {
    var type = typeof arg;
    return arg == null || (type !== "object" && type !== "function");
}

/**
 * Callback function signature for the custom reduce operation on objects.
 *
 * @callback ObjectReduceCallback
 * @param {*} accumulator - The accumulated result.
 * @param {*} currentValue - The current value being processed.
 * @param {string} currentIndex - The current key/index being processed.
 * @param {Object} object - The original object being reduced.
 * @returns {*} - The updated accumulator value after processing the current key-value pair.
 */
/**
 * Custom implementation of the reduce function for objects, applied to each key-value pair.
 *
 * @function
 * @name Object.prototype._reduce
 * @param {ObjectReduceCallback} callback - The function to execute on each key-value pair.
 *   It takes four arguments: accumulator, currentValue, currentKey, and the original object.
 * @param {*} initialValue - The initial value of the accumulator.
 * @returns {*} - The accumulated result after applying the callback to each key-value pair.
 * @this {Object} - The object to reduce.
 * @throws {TypeError} Will throw an error if the context (this) is not an object.
 *
 * @example
 * const obj = { a: 1, b: 2, c: 3 };
 * const result = obj._reduce((acc, val) => acc + val, 0);
 * console.log(result); // Output: 6
 */
function reduceObj(callback,initialValue) {
    const obj = this
    if (typeof obj !== 'object' || obj === null) {
        throw new TypeError('Object.prototype._reduce called on non-object');
    }
    let ret=initialValue
    for (const k in obj) {
        if (obj.hasOwnProperty(k)) {
            ret = callback(initialValue, obj[k], k, obj)
        }
    }
    return ret
}

function pipe(...args) {
    var ret=this, cur
    for (let i = 0; i < args.length; i++) {
        cur=args[i]
        ret = cur(ret)
    }
    return ret
}
