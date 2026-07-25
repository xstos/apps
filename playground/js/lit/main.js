
var sampleText = await (await fetch('lit-html.js')).text()

//var lines = sampleText.split('\n')
const textarr = sampleText.split('')

let counter = 0;
const container = el('app');

var tiles=textarr.map(tile)
//var lineArrays = lines.map(line=>line.split('').map(tile))
function Header(title) {
    return html`<h1>${title}</h1>`;
}

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
    const s = JSON.stringify(dup).replaceAll("\"","").replaceAll(","," ")
    return html`${s}<br>`
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
            ${Header('Classless Lit App')}
            <p>The count is currently: <strong>${count}</strong></p>
            <button @click=${onIncrement}>Increment Count</button>
            <br><br>
            ${Render(rootOpen)}

            <br><br>
        </div>
    `;
}

function increment() {
    counter++;
    update(); // Manually trigger re-render
}

function update() {
    render(CounterApp(counter, increment), container);
}
globalThis.update = update

update();