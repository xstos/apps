function observerProxy() {
    function inst() { }
    var path = []
    inst.path = path
    inst.value = undefined
    var ret = null
    ret = new Proxy(inst,{
        get(target, key, thisArg) {
            if (key==="_inst") return inst
            path.push(key)
            return ret
        },
        set(target, key, value) {
            path.push(key)
            inst.value = value
            return value
        },
        apply(target, thisArg, argumentsList) {
            return emit('apply', [...path], argumentsList)
        },
    })
    inst.proxy = ret
    return ret

}
Object.defineProperty(globalThis,"p",{
    get() {
        return observerProxy(()=>{})
    }
})

