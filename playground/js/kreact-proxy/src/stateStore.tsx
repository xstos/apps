import {customJsx} from "./reactUtil"
import {getAllIndexes} from "./util"

export function jsx(type: any, props: Record<string, any>, ...children: any[]) {
  return customJsx(type, props, ...children)
}


let state = ["h",<cursor/>]
export function load(o) {
  state = o
}
function ofType(o,type) {
  return o.type===type
}
let id = 0
export function push(item) {
    if (typeof item === "string") {
      if (item==='ctrl+enter') {
        const newId = id++
        insert(1,<cell id={newId}/>,<cursor/>, <cell_ id={newId}/>)
        return state
      }
      if (item==="ctrl+c") {
        return state
      }
      const chars = item.split('')
      console.log({chars})
      function insert(delCount: number,...items) {
        const cursors = getCursors()
        cursors.forEach(i=>{
          state.splice(i,delCount,...items)
        })
      }
      function getCursors() {
        const cursors = getAllIndexes(state,o=>ofType(o,'cursor'))
        cursors.reverse()
        return cursors
      }
      insert(0,...chars)
    }
  return state
}
export function jsxifyState() {
  const len = state.length
  const containerStack = []
  const ret = []

  for (let i = 0; i < len; i++) {
    const el=state[i]
    if (typeof el === "string") {
      ret.push(el)
    }
    const type = el.type
    if ('props' in el) {
      const id = el.props.id
      const isStart = !type.endsWith('_')
      if (isStart) {

      }
    } else {

    }
  }
  return null
}