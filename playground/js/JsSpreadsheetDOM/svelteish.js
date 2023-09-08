/** @jsx JSX */
const {h, create, diff, patch, VText} = window.virtualDom
//const template = Comp()
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
function JSX(type, props, ...kids) {
    const ret = {
        nid: undefined,
        root: undefined,
        type,
    }
    if (kids.length>0) {
        ret.kids=kids
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
    return h(type,props,children.map(hify))
}
function vars() {
    if (vars._value) {
        return vars._value
    }
    const ret = {
        set(key,value) {

        }
    }
    return ret
}
function process(node, groupName) {
    const nodes = {}
    function selector(c,i,thisArg) {
        const myid = nid()
        const isStr = typeof c ==="string"
        if (isStr) {
            const oldc = c
            c = {
                _nid: myid,
                _root: false,
                type: 'string',
                kids: [oldc]
            }
        }
        c._nid=myid
        c._root=false
        c._groupname=groupName
        nodes[myid]=c
        if (!isStr && c.kids) {
            c.kids = c.kids.map(selector)
        }
        c._numkids = c.kids ? c.kids.length : 0
        return myid
    }
    node._root=true
    let rootId
    node._nid = nid(id=>{
        nodes[id]=node
        rootId=id
    })

    node._groupname=groupName
    if (node.kids.length>0) {
        node.kids = node.kids.map(selector)
    }
    node._numkids=node.kids.length
    const flattened = flat(nodes)
    logj(flattened)

    return {
        nodes
    }
}
const foo = <root>
    <div id="derp" contentEditable={true}>
        <div>hi</div>
    </div>
</root>
process(Comp(),'derp')
function render() {
    var tree = create(hify(foo));

    elById("app2").appendChild(tree)

    var newTree = hify(<span>hi2</span>)
    var patches = diff(tree, newTree);
    tree = patch(tree, patches);
}

