
const weakMap = new WeakMap()
export function edgeBetween(objA,objB,edgeName) {
  let a = weakMap.get(objA)
  if (!a) {
    a = {}
    weakMap.set(objA,a)
  }
  a[edgeName]=new WeakRef(objB)
}
export function forEachEdge(obj,edgeName,callback) {
  let edges = null
  let wr = null
  while(true) {
    edges=weakMap.get(obj)
    if (!edges) break
    wr=edges[edgeName]
    if (!wr) break
    wr=wr.deref()
    if (wr===undefined) break
    callback(obj,wr)
    obj=wr
  }
}
function test() {
  const objList = [{id:0},{id:1},{id:2}]
  edgeBetween(objList[0],objList[1],'next')
  edgeBetween(objList[1],objList[2],'next')
  forEachEdge(objList[0],'next',(a,b)=>{
    console.log({a,b})
  })
}
