function setStyles() {

    const html = document.documentElement.style
    const body = document.body.style
    const root = document.getElementById('root').style
    const zero = "0px"
    html.margin=zero
    html.padding=zero
    body.margin=zero
    body.padding=zero
    html.width=body.width="100vw"
    html.minHeight=body.minHeight="100vh"
    root.width="100%"
    root.margin=zero
    root.padding=zero

}
setStyles()

export function isPrimitive(arg) {
    const type = typeof arg;
    return arg == null || (type != "object" && type != "function") ? [type, null] : [null, Array.isArray(arg) ? "array" : type];
}

//https://stackoverflow.com/questions/10464844/is-there-a-way-to-auto-expand-objects-in-chrome-dev-tools/27610197#27610197
export function expandedLog(item, maxDepth = 100, depth = 0) {
    if (depth > maxDepth) {
        console.log(item);
        return;
    }
    if (typeof item === 'object' && item !== null) {
        Object.entries(item).forEach(([key, value]) => {
            const [primType, nonPrimType] = isPrimitive(value)

            if (primType) {
                console.log(key + ": " + value)
                return;
            }
            console.group(key + ' : ' + nonPrimType);
            expandedLog(value, maxDepth, depth + 1);
            console.groupEnd();
        });
    } else {
        console.log(item);
    }
}

export function logj(o) {
    return console.log(JSON.stringify(o,null,2))
}