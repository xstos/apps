globalThis.log = console.log.bind(console)
globalThis.el = document.getElementById.bind(document)
globalThis.evt = []

function equalsAny(value,...compare) {
    return compare.some(c=>c===value)
}