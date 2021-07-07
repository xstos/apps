import React from "react";

function PromiseHandler(props) {
  const {promise, children, thenOrCatch, promisePassed, ...rest} = props
  const [result, setResult] = React.useState(null)
  promise[thenOrCatch](setResult)
  return result ? cloneReactChildren(children, { promiseResult: { result, passed: promisePassed }, ...rest }) : null
}

const Pass = props => <PromiseHandler thenOrCatch={'then'} promisePassed={true} {...props} />
const Fail = props => <PromiseHandler thenOrCatch={'catch'} promisePassed={false} {...props} />

function Wait(props) {
  const [done, setDone] = React.useState(false)
  props.promise.finally(() => setDone(true))
  if (done) return null
  return <>{props.children}</>
}

//handles promises as react components: Pass, Fail, Wait. See usages below.
export function ReactPromise(getPromise, callback) {
  const promise = getPromise()
  const ret = {
    Pass: (props) => <Pass promise={promise} {...props}/>,
    Fail: (props) => <Fail promise={promise} {...props}/>,
    Wait: (props) => <Wait promise={promise} {...props}/>,
  }
  if (callback) {
    return callback(ret)
  }
  return ret
}

// <Examples>
const makeExamplePromise = () => new Promise((resolve, reject) => setTimeout(()=>resolve('done!'), 1000))
const PromiseResultViewer = ({ promiseResult }) => JSON.stringify(promiseResult)

export function ExampleComponentUsage(props) {
  return ReactPromise(makeExamplePromise, ({Pass, Fail, Wait}) => (
    <div>
    <Pass>
      <PromiseResultViewer/>
    </Pass>
    <Fail>
      <PromiseResultViewer/>
    </Fail>
    <Wait>
      waiting for promise to resolve or reject
    </Wait>
    </div>
  ))
}

export function ExampleComponentAlternateUsage(props) {
  const {Pass, Fail, Wait} = ReactPromise(makeExamplePromise)
  return (
    <div>
    <Pass>
      <PromiseResultViewer/>
    </Pass>
    <Fail>
      <PromiseResultViewer/>
    </Fail>
    <Wait>
      waiting for promise to resolve or reject
    </Wait>
  </div>
  )
}
// </Examples>

// https://stackoverflow.com/a/32371612/1618433
export function cloneReactChildren(children, props) {
  const clone = child => React.isValidElement(child) ? React.cloneElement(child,{ ...child.props, ...props }) : child
  return React.Children.map(children, clone)
}
