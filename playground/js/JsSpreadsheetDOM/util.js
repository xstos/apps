function log(...items) {
    console.log(...items)
}
function logj(...items) {
    log(...items.map(i=>JSON.stringify(i,null,2)))
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
            const {width, height} = entry.contentRect
            //log('size changed',entry.target, width,height)
            callback({target: entry.target, width, height})
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
    return frag.childNodes[0]
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
