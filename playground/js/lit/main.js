
var sampleText = await (await fetch('lit-html.js')).text()

//var lines = sampleText.split('\n')
const textarr = sampleText.split('')

let counter = 0;
const container = el('app');

var tiles=textarr.map(tile)
//var lineArrays = lines.map(line=>line.split('').map(tile))

function tile(char) {
    if (char==='\n')
        return html`<br>`
    return html`<div class="hovergrow" style="color: ${getRandomColor(1)}; background-color: ${getRandomColor(0.2)}">${char}</div>`
}
var id=0
function RenderNode(n) {
    if (n==="cursor") {
        return html`<span id="cursor">█</span>`
    }
    if (Array.isArray(n)) {
        return n.map(RenderNode)
    }
    id++
    return html`<span id="${id}">${n}</span>`
}
function Render(n) {
    const t = nodeGetType(n)
    if (nodeTypeIsChar(n)) {
        const c = String.fromCharCode(nodeGetData(n))
        if (c==="\n") {
            return html`↵<br>`
        }
        return html`<span>${c}</span>`
    }
    if (nodeTypeIsOpen(n)) {
        return RenderBox(n)
    }
    if (nodeTypeIsCursor(n)) {
        return html`<span>█</span>`
    }
}
function strf(o) {
    const dup = {...o};
    delete dup[nodePropKey_Type]
    delete dup[nodePropKey_Data]
    if (dup[nodePropKey_Pair]===0) {
        delete dup[nodePropKey_Pair]
    }
    //const s = JSON.stringify(dup).replaceAll("\"","").replaceAll(","," ").replaceAll(":","")
    let sval = dup.s
    delete dup.s
    const e = Object.entries(dup)
    function div(val, fontSize) {
        return html`<div class="item" style="font-size: ${fontSize};">${val}</div>`
    }

    function selector(item) {
        const [k,v]=item
        return div(k+v,"0.4em")
    }
    const br = sval==="\n" ? html`<br>` : null
    sval = sval === "\n" ? "↵" : sval
    return html`<div id="${dup[nodePropKey_Id]}" class="container">${div(sval, "1em")}${e.map(selector)}</div>${br}`
}
function RenderBox(first) {
    const last = nodeGetPair(first) //
    let it = nodeGetNext(first);
    const items = []
    while(!nodeIsEqual(it,last)) {
        if (nodeTypeIsChar(it)) {
            items.push(html`${strf(it)}`)
        } else if (nodeTypeIsOpen(it)) {
            items.push(RenderBox(it))
            const close = nodeGetPair(it)
            it=close;
        } else if (nodeTypeIsClose(it)) {
            debugger
        } else if (nodeTypeIsCursor(it)) {
            items.push(html`${strf(it)}`)
        }
        it=nodeGetNext(it)
    }
    const boxId = first[nodePropKey_Id];
    const openStr = nodeTypeStrings[first[nodePropKey_Type]];
    const closeStr = nodeTypeStrings[last[nodePropKey_Type]];
    log(openStr,closeStr)
    var spacer = isRootOpen(first) ? html`<br>` : ""
    return html`${strf(first)}${spacer}${items}${spacer}${strf(last)}`
    //return html`<span>${openStr}${boxIndex}</span>${derp.map(Render)}<span>${boxIndex}${closeStr}</span>`
}
function v(...args) {
    log(JSON.stringify(args))
}
v`a${"arg1"}b${"arg2"}c`;
function CounterApp(count, onIncrement) {
    return html`
        <e-l derp></e-l>
        <div>
            <p>The count is currently: <strong>${count}</strong><button @click=${onIncrement}>+</button></p>
            ${Render(rootOpen)}
        </div>
    `;
}
function getCursorElement() {
    return el(getCursorId().toString())
}
function increment() {
    counter++;
    update(); // Manually trigger re-render
}

function update() {
    render(CounterApp(counter, increment), container);
    getCursorElement().scrollIntoView()
}
globalThis.update = update

update();