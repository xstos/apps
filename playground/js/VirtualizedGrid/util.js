var log=console.log;
var _ = {
    isString(obj) {
        return toString.call(obj) == `[object ${'String'}]`;
    },
    isFunction(obj) {
        return toString.call(obj) == `[object ${'Function'}]`;
    },
    isNumber(obj) {
        return toString.call(obj) == `[object ${'Number'}]`;
    }
}
function logj(...args) {
    log(...args.map(a=>JSON.stringify(a)))
}
function createElement(tag) {
    return document.createElement(tag);
}
function createTextNode(txt) {
    return document.createTextNode(txt);
}
var defs = {}
Object.defineProperty(Object.prototype,'$',{
    get(){
        var that = this;
        const methods = {
            forEach(selector) {
                for (var i = 0, l = that.length; i < l; i++) {
                    selector(that[i],i)
                }
            },
            set(name) {
                defs[name]=that
                log('def',name,that)
                return that
            },
            get(name) {
                return defs[name]
            },
        }
        function ret(cb) {
            return cb(that)
        }
        Object.assign(ret,methods)
        return ret
    }
})
function get(name) {
    return ''.$.get(name)
}
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
function cloneCSS(x) {
    const sheet = new CSSStyleSheet();
    const css = Array.from(x.cssRules).map(rule => rule.cssText).join(' ');
    sheet.replaceSync(css);
    return sheet;
}
function getGlobalStyleSheets() {
    if (globalSheets === null) {
        globalSheets = Array.from(document.styleSheets).map(cloneCSS);
    }

    return globalSheets;
}
//https://eisenbergeffect.medium.com/using-global-styles-in-shadow-dom-5b80e802e89d
function addGlobalStylesToShadowRoot(shadowRoot,...styleSheets) {
    shadowRoot.adoptedStyleSheets.push(
        ...styleSheets
    );
}
function debounce_leading(func, timeout = 300){
    let timer;
    return ret;

    function ret(...args) {
        if (!timer) {
            func(...args)
        }
        clearTimeout(timer);
        timer = setTimeout(() => {
            timer = undefined;
            func(...args)
        }, timeout);
    }
}

function getScrollbarSize() {
    // Create a temporary element
    const tempDiv = document.createElement("div");

    // Set styles to make the scrollbar appear
    tempDiv.style.visibility = "hidden";
    tempDiv.style.overflow = "scroll"; // Forces scrollbar visibility
    tempDiv.style.position = "absolute"; // Prevent it from affecting the layout
    tempDiv.style.width = "100px"; // Arbitrary width
    tempDiv.style.height = "100px"; // Arbitrary height

    // Append it to the body
    document.body.appendChild(tempDiv);

    // Create a child element to measure the inner size
    const innerDiv = document.createElement("div");
    innerDiv.style.width = "100%";
    innerDiv.style.height = "100%";
    tempDiv.appendChild(innerDiv);

    // Calculate scrollbar size
    const scrollbarWidth = tempDiv.offsetWidth - innerDiv.offsetWidth;
    const scrollbarHeight = tempDiv.offsetHeight - innerDiv.offsetHeight;

    // Remove the temporary element
    document.body.removeChild(tempDiv);

    return { width: scrollbarWidth, height: scrollbarHeight };
}
function arrayEnu(array) {
    var i =0
    function next() {
        return array[i++]
    }
    return next
}


