/** @jsx JSX */
const {h, create, diff, patch, VText} = window.virtualDom
function nid(cb) {
    let ret
    if (Reflect.has(nid, "_seed")) {
        ret = ++nid._seed
        cb && cb(ret)
        return ret
    }
    nid._seed=1
    cb && cb(1)
    return 1
}
function JSX(type, props, ...children) {
    const ret = {
        nid: undefined,
        root: undefined,
        type,
    }
    if (children.length>0) {
        ret.children=children
    }
    if (props && Object.keys(props).length>0) {
        ret.props=props
    }
    return ret
}

function Comp() {
    const open = `<`
    const close = `>`
    const bkslash = '/'

    return <template>
        <span>
        {open}<slot name="type"/>{close}
        <slot/>
        {open}<slot name="type"/>{bkslash}{close}
    </span>
    </template>
}

function hify(jsx) {
    if (typeof jsx==="string") return jsx
    const {type,props,children} = jsx
    return h(type,props||{},(children || []).map(hify))
}
function flattenJsx(node, groupName) {
    const nodes = {}
    function selector(c,i,thisArg) {
        const myid = nid()
        const isStr = typeof c ==="string"
        if (isStr) {
            const oldc = c
            c = {
                _nid: myid,
                type: 'string',
                children: [oldc]
            }
        }
        c._nid=myid
        c._groupname=groupName
        nodes[myid]=c
        if (!isStr && c.children) {
            c.children = c.children.map(selector)
        }
        c._numchildren = c.children ? c.children.length : 0
        return myid
    }

    node._nid = nid(id=>{
        nodes[id]=node
        node._root=true
    })

    node._groupname=groupName
    if (node.children.length>0) {
        node.children = node.children.map(selector)
    }
    node._numchildren=node.children.length
    const flattened = flat(nodes)
    logj(flattened)

    return flattened
}
const foo = <root>
    <div id="derp" contentEditable={true}>
        <div>hi</div>
    </div>
</root>

function path(p) {
    return p.split('.')
}
function nodeIdsByType(o) {
    let value
    for (const key in o) {
        value=o[key]
        const [a,b,c] = path(key)
        if (b==='type') {
            if (value==='slot') {
            }
        }
    }
}


function render() {
    var tree = create(hify(<div></div>));

    elById("app2").appendChild(tree)

    var newTree = hify(foo2)
    var patches = diff(tree, newTree);
    tree = patch(tree, patches);
}
function replaceByClassName(nodes, name) {

}


const foo2 = <div data-root="true">
    <div className="me">hi</div>
    <div className="me">hi2</div>
</div>

//render(foo2)
const flatNodes = flattenJsx(foo2,'derp')


