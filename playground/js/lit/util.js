globalThis.log = console.log.bind(console)
globalThis.el = document.getElementById.bind(document)
globalThis.evt = []
const {html, render} = lit();
function rndByte() {
    return Math.floor(Math.random() * 255)
}
function getRandomColor(transp0to1) {
    return `rgba(${rndByte()},${rndByte()},${rndByte()}, ${transp0to1})`;
}
function equalsAny(value,...compare) {
    return compare.some(c=>c===value)
}