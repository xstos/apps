var log=console.log
function createElement(tag) {
    return document.createElement(tag);
}
function createTextNode(txt) {
    return document.createTextNode(txt);
}

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
    //console.log(withel)
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
function iterateNodes(node, selector) {
    node.childNodes.forEach(child => {
        selector(child)
        iterateNodes(child, selector); // Recursive call for each child node
    });
}
function HTML(markup) {
    var t = createElement('template')
    t.innerHTML = markup
    return t.content
}
function isFunction(thing) {
  return typeof thing === 'function' && thing && thing.call;
}
let globalSheets = null;

function getGlobalStyleSheets() {
    if (globalSheets === null) {
        globalSheets = Array.from(document.styleSheets)
            .map(x => {
                const sheet = new CSSStyleSheet();
                const css = Array.from(x.cssRules).map(rule => rule.cssText).join(' ');
                sheet.replaceSync(css);
                return sheet;
            });
    }

    return globalSheets;
}

function addGlobalStylesToShadowRoot(shadowRoot) {
    shadowRoot.adoptedStyleSheets.push(
        ...getGlobalStyleSheets()
    );
}