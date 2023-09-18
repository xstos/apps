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

const derp = `
<button
        type="button"
        data-te-ripple-init
        data-te-ripple-color="light"
        class="
        inline-block 
        rounded 
        bg-primary 
        px-1 
        pb-1 
        pt-1 
        text-xs 
        font-medium 
        uppercase 
        leading-normal 
        text-white 
        shadow-[0_4px_9px_-4px_#3b71ca] 
        transition duration-150 ease-in-out 
        hover:bg-primary-600 
        hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] 
        focus:bg-primary-600 
        focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] 
        focus:outline-none 
        focus:ring-0 
        active:bg-primary-700 
        active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] 
        dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] 
        dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] 
        dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] 
        dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]
">
    Button
</button>`

const inteli = `
    <div class="flex flex-col">
            
            <div class="flex-none dbg">
                <x-input>foo</x-input>    
            </div>
            <div class="flex-1 dbg">
                ${searchResults}
            </div>
        </div>`;
const gridExample = `<div style="display: grid; 
        grid-template-columns: repeat(auto-fit,minmax(20ch,1fr));
        grid-template-rows: repeat(auto-fit, 20ch);
">
            
                
        </div>`
