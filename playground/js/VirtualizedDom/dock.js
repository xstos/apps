class Dock extends HTMLElement {
    static observedAttributes = ["x-dock"];
    cc = null;
    dc = null;
    ac = null;
    constructor() {
        super();
        var dockEl = this
        //remove text cuz we only support container elements
        dockEl.childNodes.forEach((n,i) => n.nodeType === 3 && n.remove())
        var a = dockEl.childNodes[0]
        var b = dockEl.childNodes[1]
        b.ondblclick = (e) => {
            dockEl.setAttribute("x-dock", nextDock())
            e.stopPropagation()
        }

        function getDock() {
            return dockEl.getAttribute("x-dock")
        }
        function onDockChanged(dock) {
            let s = dockEl.style;
            if (dock==="top") {
                s.flexDirection = "column"
            }
            if (dock==="bottom") {
                s.flexDirection = "column-reverse"
            }
            if (dock==="left") {
                s.flexDirection = "row"
            }
            if (dock==="right") {
                s.flexDirection = "row-reverse"
            }
        }
        function nextDock() {
            var d = getDock()
            if (d === "top") return "bottom"
            if (d === "bottom") return "left"
            if (d === "left") return "right"
            if (d === "right") return "top"
            return "top"
        }
        function connectedCallback() {
            dockEl.parentElement.style.display="flex"
            dockEl.style.flexGrow="1"
            dockEl.style.display="flex"
            onDockChanged(getDock())
            b.style.flexGrow="1"
        }

        function disconnectedCallback() {
        }

        function attributeChangedCallback(name, oldValue, newValue) {
            if (name==="x-dock") {
                //log({name,newValue})
                onDockChanged(newValue)
            }
        }

        this.ac = attributeChangedCallback
        this.cc = connectedCallback;
        this.dc = disconnectedCallback;
    }
    attributeChangedCallback(name, oldValue, newValue) {
        this.ac(name, oldValue, newValue)
    }

    connectedCallback() {
        this.cc()
    }

    disconnectedCallback() {
        this.dc()
    }
}
customElements.define("x-dock", Dock);