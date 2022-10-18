// @ts-ignore
import vectorizeText from "vectorize-text"

export function vectxt(text) {
  const spl =text.split('')
  return spl.map(vt).flat()

}
function opts() {
  return {
    width: 250,
    textBaseline: "hanging",
    font: "'Consolas', sans-serif",
    size: 32
  }
}
function vt(text) {
  var graph = vectorizeText(text, opts())
  /*
  var svg = ['<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"  width="500"  height="80" >']
  graph.edges.forEach(function(e) {
    var p0 = graph.positions[e[0]]
    var p1 = graph.positions[e[1]]
    svg.push('<line x1="' + p0[0] + '" y1="' + p0[1] +
      '" x2="' + p1[0] + '" y2="' + p1[1] +
      '" stroke-width="2" stroke="white" />')
  })
  svg.push("</svg>")
  document.body.innerHTML=svg.join("")+document.body.innerHTML
   */
  const {positions,edges} = graph
  return edges.map(e=>{
    let [x1,y1] = positions[e[0]]
    let [x2,y2] = positions[e[1]]
    console.log(x1,y1,x2,y2)
    return [x1,y1,x2,y2]
  })
}
export function vectxttris(text) {
  const complex = vectorizeText(text, {...opts(), triangles: true})
  const ret = []
  complex.cells.forEach(function(c) {
    debugger
    for(var j=0; j<3; ++j) {
      var [x1,y1] = complex.positions[c[j]]
      var [x2,y2] = complex.positions[c[(j+1)%3]]
      ret.push(x1,y1,x2,y2)
    }
  })
  return ret
}