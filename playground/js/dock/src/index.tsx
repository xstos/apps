import * as React from 'react'
import ReactDOM from 'react-dom'
import hyperactiv from 'hyperactiv'
import {Derp} from './ui'
const { observe, computed } = hyperactiv

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

function App(props) {

    return (
        <>
            <Derp>
                <div>yo</div>
                <Derp><div>yo2</div><div>yo3</div></Derp>
            </Derp>
        </>

    )
}


ReactDOM.render( //render our app inside the 'root' div element
  React.createElement(App),
  document.getElementById('root')
)
