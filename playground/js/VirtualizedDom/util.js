function getEl(id) {
    return document.getElementById(id)
}
function remove(el) {
    el && el.remove()
}

function insertBefore(before, el) {
    before.parentElement.insertBefore(el, before);
}

function replace(el, withel) {
    console.log(withel)
    el.replaceWith(withel)
}

function fromtemp(templateId) {
    var foo = getEl(templateId)
    var clone = foo.content.cloneNode(true)
    return clone
}