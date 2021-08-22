import { useEffect } from "react"
import * as React from "react"

function makeCursor() {
    return make('span', { kcursor: true }, ['█'])
}
function make(type, props={}, children=[]) {
    return { type, props, children }
}
function OldApp() {
    const foo = <Write name="uppercase sentence">
        <ToUpperCase>
        </ToUpperCase>
    </Write>
    return (
        <>
            <pre>
                <Write name="sentence">this is a sentence<Write></Write></Write>
                <Read name="sentence"/>
            </pre>
        </>
    )
}
const state = {
    children: [],
    vars: {}
}

const shared = store({
    byId: [],
    set: (id, value) => {
        console.log('set shared',id,value)
        shared.byId[id]=value
    }
});

const X2 = view((props) =>{
    const { f, children, type, id, name } = props

    useEffect(()=>{

        return ()=>{

        }
    })

    const cloned = React.Children.map(children, (child,i)=>{
        if (React.isValidElement(child)) {
            const { props } = child
            const { children, ...rest } = props
            debugger
            return React.cloneElement(child, { parentId: id, ...rest }, children)
        }
    })
    if (type === 'Write') {

    }
    if (type === 'Read') {
        console.log('render read', id)
        const value = shared.byId[0];
        return <span>{value}</span>
    }
    const onChange = (e) => {
        let value = e.target.value;
        console.log('onChange', value)
        shared.set(id, value )
    };
    return <div>
        <input { ...{onChange} } />
    </div>
})

class X extends React.Component {
    constructor(props) {
        super(props)
        const { f, children, type, id, name } = props

        console.log(id, this)
        const myObj = {}
        function getValue() {
            if (_.isString(children)) {
                return children
            }
        }

        this.componentDidMount = () => {
            console.log('mount', id)
            state.children[id] = myObj
            if (f) {
                let data = getValue()[f]();
                console.log('value',data)
            }
            if (type==='Write') {
                let data = getValue()
                myObj.value = data
                myObj.name = name
                state.vars[name]=myObj
                this.render = () => {
                    console.log('render', id)
                    return <div>{data}</div>
                }
            }
            if (type==='Read') {
                this.render = () => {
                    console.log('render', id)
                    return <div>read</div>
                }
            }
            // React.Children.forEach((child, index) => {
            //     if (React.isValidElement(child)) {
            //     }
            // }, props.children)
        }
        this.componentWillUnmount = () => {
            console.log('unmount', id)
        }
        this.render = () => {
            console.log('render', id)
            return <div style={{ border: "1px solid red"}}>{props.children}</div>
        }
    }
}

function ToUpperCase(props) {
    const { children, ...rest } = props
    return <X2 id={getId()} f='toUpperCase' {...rest}>
        {children}
    </X2>
}
function Write(props) {
    return <X2 id={getId()} type="Write" {...props}/>
}

function Read(props) {
    return <X2 id={getId()} type="Read" {...props}/>
}