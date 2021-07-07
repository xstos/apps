import React, { useEffect } from "react";

export const nameof = obj => Object.keys(obj)[0]
const injectProps = props => cloneReactChildren(props.children, {promiseResult: props.promiseResult})
export const ResolveR = props => injectProps(props)
export const RejectR = props => injectProps(props)
export const PendingR = props => injectProps(props)

export function PromiseR(props) {
  const { getPromise, children, ...rest } = props
  const [resolve, setResolve] = React.useState(null)
  const [reject, setReject] = React.useState(null)
  useEffect(()=>{
    getPromise().then(setResolve).catch(setReject)
  },[])

  const isOurs = (child) => ({ ResolveR, RejectR, PendingR })[child.type.name]
  function clone(child, type, success, value) {
    if (!React.isValidElement(child) || !isOurs(child)) return child
    if (type !== child.type.name) return null
    const inject = {promiseResult: {success, value}}
    return React.cloneElement(child, {...child.props, ...inject})
  }

  const map = (keyObj, success, value) =>
    React.Children.map(children, (child) => clone(child, nameof(keyObj), success, value))

  if (resolve) return map({ResolveR}, true, resolve)
  if (reject) return map({RejectR}, true, reject)
  return map({PendingR}, false, null)
}

// https://stackoverflow.com/a/32371612/1618433
export function cloneReactChildren(children, props) {
  const clone = child => React.isValidElement(child) ? React.cloneElement(child,{ ...child.props, ...props }) : child
  return React.Children.map(children, clone)
}

// <Examples>
const makeExamplePromise = () => new Promise((resolve, reject) => setTimeout(()=>resolve('done!'), 1000))
const PromiseResultViewer = ({ promiseResult }) => JSON.stringify(promiseResult)

export function ExampleComponentUsage(props) {
  return (
    <PromiseR getPromise={makeExamplePromise}>
      <ResolveR>
        resolve
        <PromiseResultViewer></PromiseResultViewer>
      </ResolveR>
      <RejectR>
        reject
        <PromiseResultViewer></PromiseResultViewer>
      </RejectR>
      <PendingR>
        pending
        <PromiseResultViewer></PromiseResultViewer>
      </PendingR>
    </PromiseR>
  )
}
