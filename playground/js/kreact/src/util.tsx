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
