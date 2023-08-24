/** @jsx JSX */
const {html, reactive} = window.arrowJs
const {h,render} = window.fre
const log = console.log

function JSX(type, props, children=[]) {

    //props=props||{}
    //return {type,props,children}
    return h(type,props,...children)
}

const elementIds = {
    flip: 'flip'
}

const store = reactive({
    style: {
        ['background-color']: 'red'
    }
})
function myappComponent() {
    const btnStyle = "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
    const myapp = html`
<div class="flex flex-row">
    <div class="flex-none">
        <button id="${elementIds.flip}" class="${btnStyle}">
            FLIP!
        </button>
    </div>
    <div class="flex-1">
        ${()=>iWillFlipComponent()}
        some more crap
    </div>
</div>
`;
    return myapp
}

function iWillFlipComponent() {
    const entries = Object.entries(store.style)
    const styles = css(entries)
    log('iWillFlipComponent render')
    return html`<div class="w-full" style="${()=>styles}">
        i will flip
    </div>`
}

const buttonEvents = {
    [elementIds.flip](evt) {
        let s = store.style;
        if (s['background-color']==='red') {
            s['background-color']='blue'
        }
        else {
            s['background-color']='red'
        }
    }
}
function onEvent(type,e) {
    const el = e.target
    log(type,el)
    const { nodeType, nodeName, id } = el

    if (nodeType===1) { //element
        if (nodeName==="BUTTON") {
            buttonEvents[id](e)
        }
    }
}

hookupEvents()
myappComponent()(appElement()) //render the app

//plumbing below
function css(entries) {
    return entries.map(([k, v]) => {
        return `${k}: ${v};`; //css
    }).join('')
}
function hookupEvents() {
    document.addEventListener('click', (e)=>{
        onEvent('click',e)
    })
}
function appElement() {
    return document.getElementById('app')
}
