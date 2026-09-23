class EL extends HTMLElement {
    static observedAttributes = [];

    constructor() {
        super();
        this.style.display = "contents"
    }
    connectedCallback() {
        evtcb(this, "connected");
    }
    disconnectedCallback() {
        evtcb(this, "disconnected");
    }
    adoptedCallback() {
        evtcb(this, "adopted");
    }
    attributeChangedCallback(...args) {
        evtcb(this,"attributeChanged", ...args);
    }
}
var dockMap = {
    top: "column",
    bottom: "column-reverse",
    left: "row",
    right: "row-reverse"
}
function evtcb(instance, name, ...args) {
    var c = [...instance.children]
    instance.replaceChildren()
    if (instance.hasAttribute("dock") && c.length>1) {
        var dir = instance.getAttribute("dock")
        c[1].style.flexGrow=1
        render(html`<div style="display: flex;flex-grow: 1;flex-direction: ${dockMap[dir]};">${c}</div>`,instance)
    }

    log(instance, name, ...args);
}
customElements.define("e-l",EL)