
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
    const t = getType(n)
    if (isChar(n)) {
        const c = String.fromCharCode(getData(n))
        if (c==="\n") {
            return html`↵<br>`
        }
        return html`<span>${c}</span>`
    }
    if (isOpen(n)) {
        return RenderBox(n)
    }
    if (isCursor(n)) {
        return html`<span>█</span>`
    }
}
function strf(o) {
    const dup = {...o};
    delete dup[keyType]
    delete dup[keyData]
    if (dup[keyPair]===0) {
        delete dup[keyPair]
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
    return html`<div id="${dup[keyIndex]}" class="container">${div(sval, "1em")}${e.map(selector)}</div>${br}`
}
function RenderBox(first) {
    const last = getPair(first) //
    let it = getNext(first);
    const items = []
    while(!nodeEqual(it,last)) {
        if (isChar(it)) {
            items.push(html`${strf(it)}`)
        } else if (isOpen(it)) {
            items.push(RenderBox(it))
            const close = getPair(it)
            it=close;
        } else if (isClose(it)) {
            debugger
        } else if (isCursor(it)) {
            items.push(html`${strf(it)}`)
        }
        it=getNext(it)
    }
    const boxIndex = first[keyIndex];
    const openStr = typeStrings[first[keyType]];
    const closeStr = typeStrings[last[keyType]];
    log(openStr,closeStr)
    return html`${strf(first)}${items}${strf(last)}`
    //return html`<span>${openStr}${boxIndex}</span>${derp.map(Render)}<span>${boxIndex}${closeStr}</span>`
}
function CounterApp(count, onIncrement) {
    return html`
        <div>
            <p>The count is currently: <strong>${count}</strong><button @click=${onIncrement}>+</button></p>
            ${Render(rootOpen)}
        </div>
    `;
}
function getCursorElement() {
    return el("2")
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