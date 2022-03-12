import hyperactiv from "hyperactiv";
import { match, select } from 'ts-pattern';

const { observe, computed } = hyperactiv

type TData = { type:'io', key:string }

export function Machine(state) {

  const retObs = observe(state)

  let inputFunction = inputFunctionDefault

  function inputFunctionDefault(data: TData) {
    match(data)
      .with({ type: 'io' }, (v) => {
        console.log(v)
      })
  }

  function addNode(n) {
    const nodeIndex = state.nodes.length
    state.nodes.push(n)
    return nodeIndex
  }
  function input(data) {
    console.log(data)
    //const nodeIndex = addNode(data)
    inputFunction(data)
  }
  state.input = input
  return state;
}