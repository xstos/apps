
var text = await (await fetch('lit-html.js')).text()

//var lines = text.split('\n')
const textarr = text.split('')
var {html, render} = lit
let counter = 0;
const container = el('app');

var tiles=textarr.map(tile)
//var lineArrays = lines.map(line=>line.split('').map(tile))
var state = ['cursor ']
function Header(title) {
    return html`<h1>${title}</h1>`;
}
function rndByte() {
    return Math.floor(Math.random() * 255)
}
function getRandomColor(transp0to1) {
    return `rgba(${rndByte()},${rndByte()},${rndByte()}, ${transp0to1})`;
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
function RenderBox(first) {
    const last = getPair(first) //
    const derp = Array.from(getChildren(first))
    log(...derp)
    const boxIndex = first[keyIndex];
    const openStr = typeStrings[first[keyType]];
    const closeStr = typeStrings[last[keyType]];
    log(openStr,closeStr)
    return html`<span>${openStr}${boxIndex}</span>${derp.map(Render)}<span>${boxIndex}${closeStr}</span>`
}
function RenderState(s) {

    return RenderNode(s)
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

// 3. State Mutation Handler
function increment() {
    counter++;
    update(); // Manually trigger re-render
}

// 4. Render Engine Setup
function update() {
    render(CounterApp(counter, increment), container);
}
globalThis.update = update
// Initial Bootstrapping
update();