class EL extends HTMLElement {
    static observedAttributes = [];

    constructor() {
        super();
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
function evtcb(instance, name, ...args) {
    if (instance.parentElement.id==="app") {
        render(html`<span>${instance.hasAttribute("derp")}</span>`,instance)
    }
    log(instance, name, ...args);
}
customElements.define("e-l",EL)