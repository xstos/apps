import * as React from "react";

export function idGen() {
  let id = 0
  return () => id++
}


export function cloneReactChildren(children, validChildSelector, invalidChildSelector=null) {
  invalidChildSelector = invalidChildSelector || ((child)=>child)
  function clone(child) {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, validChildSelector(child));
    } else {
      return invalidChildSelector(child);
    }
  }

  return React.Children.map(children, clone)
}