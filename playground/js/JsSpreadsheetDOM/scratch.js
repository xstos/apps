function vdomex() {
    const id = getId()
    this._id = id
    const count = cellx(1)
    const ourdata ={
        tag: cellx("div")
    }
    cells[id] = ourdata
    function render() {
        return h("div",{},[String(count())]);             // We need an initial tree
    }
    var tree = editor()
    var rootNode = create(tree);     // Create an initial root DOM node ...
    this.appendChild(rootNode);    // ... and it should be in the document
    let foo = cellx(()=>{
        log("change")
        count()

    })
    count.onChange(e=>{
        var newTree = editor()
        var patches = diff(tree, newTree);
        rootNode = patch(rootNode, patches);
        tree = newTree;
    })
    this.ccb = function() {
        setInterval(()=>{
            log("interval")
            count(count()+1)

            cells[id].tag("pre")
        }, 2000)

    }
    function hify(jsx) {
        const {type,props,children} = jsx
        return h(type,props,children.map(hify))
    }
    function editor() {
        return hify(<div id={id}>
            <input type="text" />
        </div>)
    }
}
