import React from "react";
import ReactDOM from 'react-dom'

const reactMode = true
export function jsx(tag: any, props: Record<string, any>, ...children: any[]) {
  if (reactMode) return React.createElement(tag,props,...children)
  //console.log({type,props,children})
  if (props) {
    return {type: tag, props, children}
  }

  return {tag, children}
}

export function StateMachine(props) {
  return <div>{JSON.stringify(props.menu)}</div>
}