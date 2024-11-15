var log=console.log

Object.defineProperty(Object.prototype,'$',{
    get(){
        var that = this;
        return {
            forEach(selector) {
                for (var i = 0, l = that.length; i < l; i++) {
                    selector(that[i],i)
                }
            }
        }
    }
})

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
function isX(el) {
    return el.tagName.startsWith("X-")
}
function isCell(el) {
    return el.tagName.startsWith("X-CELL")
}
function swap(el1,el2) {
    var temp1 = document.createElement("span");
    var temp2 = document.createElement('span')
    replace(el1,temp1)
    replace(el2,temp2)
    replace(temp1,el2)
    replace(temp2,el1)
}
