//keystrokes.bindKey('a', () => log('You\'re pressing "a"'))

document.addEventListener('keydown', event => {
    const k = event.key.toLowerCase()

    if (k==="control" || k==="alt" || k==="shift") return
    const mod = [event.ctrlKey && "ctrl", event.altKey && "alt", event.shiftKey && "shift"]
        .filter(v=>v)

    var key = [...mod, k].join("+")
    if (equalsAny(key, 'ctrl+a', 'tab')) {
        event.preventDefault()
    }
    if (key==="enter") {
        key="\n"
    }
    evt.push({ t: 'io', key})
});