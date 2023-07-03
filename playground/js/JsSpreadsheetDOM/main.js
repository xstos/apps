/** @jsx JSX */

const {cellx, Cell} = window.cellx

const foo = <div></div>
log(foo)
function JSX(tag,props,children=[]) {
    props=props||{}
    return {tag,props,children}
}

function cursor() {
    return `<k-cursor active></k-cursor>`
}
const data = reactive({
    nodes: [cursor()]
})

const derp = html`<div>hi</div>`

const appElement = document.getElementById('app');
const dockLeft = html`
<div class="flex flex-row">
    <div class="flex-none">
        ${()=>html`${listbox()}`}
    </div>
    <div class="flex-1">
        ${()=>html`${data.nodes.join('')}`}
    </div>
</div>
`
function listbox() { return `
    <select size="20">
        <option>textbox</option>
        <option>button</option>
        <option>2</option>
        <option>2</option>
        <option>2</option>
        <option>2</option>

    </select>
`}

const template = html`
<div class="flex">
    ${dockLeft}
</div>
`

document.addEventListener('change',(e)=>{
    if (e.target.nodeType===1) { //element
        if (e.target.nodeName==="SELECT") {
            log(e.target.value)
        }
    }
})

template(appElement)







function log(...items) {
    console.log(...items)
}

function lorem() { return 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.' }

function bindkeys(onkey, shouldHandleCallback) {

    document.addEventListener('keydown', event => {
        const key = event.key.toLowerCase()

        if (key==="control" || key==="alt" || key==="shift") return
        const mod = [
            event.ctrlKey && "ctrl",
            event.altKey && "alt",
            event.shiftKey && "shift"]
            .filter(v=>v)

        const foo = [...mod, key].join("+")
        if (shouldHandleCallback) {
            const shouldHandle = shouldHandleCallback(event, foo)
            if (shouldHandle === false) return
        }
        pressed({ tag: 'io', key: foo })
    });
    function pressed(e) {
        //console.log(e)
        const o = { tag: "io",  key: e.key.toLowerCase() }
        onkey(o)
    }
    /*
    document.addEventListener('click', (event)=> {
      console.log('emitting click events');
    })

    document.addEventListener('dblclick',(event)=>{
      console.log('emitting double click events');
    } )

    document.addEventListener('contextmenu', (event)=>{
      console.log('emitting right click events');
    })

    document.addEventListener('mouseenter',(event)=> {
      console.log("mouse enter, hovering started")
    })

    document.addEventListener('mouseleave', (event)=> {
      console.log("hovering finished")
    })
    */
    return onkey
}

function cyclowExample() {
    const cyclow = window.cyclow
    const {Block, run} = cyclow

    const Counter = () => Block({
        on: {
            'in.init':  () => counter => 0,
            'dom.increment': () => counter => counter + 1,
            'dom.decrement': () => counter => counter - 1
        },
        view: counter => ({tag:'div#app', content: [
                {tag: 'div.counter', content: `${counter}`},
                {tag: 'div.buttons', content: [
                        {tag: 'button', on: {click: 'decrement'}, content: '-'},
                        {tag: 'button', on: {click: 'increment'}, content: '+'}
                    ]}
            ]})
    })

    run(Counter, {target: 'app2'})
}

function cellxExample() {
    let num = cellx(1);
    let plusOne = cellx(() => num() + 1);
    plusOne.on(Cell.EVENT_CHANGE, (evt) => {
        data.foo=evt.data.value
        console.log(JSON.stringify(evt.data)) // {"prevValue":2,"value":3}
    })
    num(2)
}

//https://webreflection.medium.com/bringing-jsx-to-template-literals-1fdfd0901540