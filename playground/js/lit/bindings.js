//keystrokes.bindKey('a', () => log('You\'re pressing "a"'))

document.addEventListener('keydown', event => {
    let k = event.key.toLowerCase()

    if (k==="control" || k==="alt" || k==="shift") return
    let mod = [event.ctrlKey && "ctrl", event.altKey && "alt", event.shiftKey && "shift"]
        .filter(v=>v)
    if (mod.length==1 && mod[0]==="shift") {
        mod=[]
        k=k.toUpperCase()
    }
    var key = [...mod, k].join("+")
    if (equalsAny(key, 'ctrl+a', 'tab')) {
        event.preventDefault()
    }
    if (key==="enter") {
        key="\n"
    }
    log(key)
    evt.push({ t: 'io', key})
});