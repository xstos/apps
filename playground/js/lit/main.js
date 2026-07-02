
var text = await (await fetch('lit-html.js')).text()

//var lines = text.split('\n')
const textarr = text.split('')
var {html, render} = lit
// 1. Define the Application State
let counter = 0;
const container = el('app');

var tiles=textarr.map(tile)
//var lineArrays = lines.map(line=>line.split('').map(tile))
var state = ['cursor ']
// 2. Define Pure Functional Components
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
function RenderBox(first) {
    const last = getPair(first) //
    return html`
        <span>${typeStrings[first[keyType]]}${first[keyIndex]}</span>
        <span>${first[keyIndex]}${typeStrings[last[keyType]]}</span>
    `
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
            ${RenderBox(rootOpen)}

            <br><br>
            ${tiles}
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

// Initial Bootstrapping
update();