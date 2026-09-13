
globalThis.log = console.log.bind(console)
globalThis.el = document.getElementById.bind(document)
const {html, render} = lit();
function equalsAny(value,...compare) {
    return compare.some(c=>c===value)
}
var counter = 0;
const container = el('app');

function increment() {
    counter++;
    update(); // Manually trigger re-render
}
function CounterApp(count, onIncrement) {
    return html`
        <div>
            <p>The count is currently: <strong>${count}</strong><button @click=${onIncrement}>+</button></p>
        </div>
    `;
}
function update() {
    render(CounterApp(counter, increment), container);
}

update();