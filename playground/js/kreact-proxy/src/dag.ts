import DAG from 'the-dag'
const aDAG = new DAG();
function add(...ids) {
  aDAG.addNodes(ids.map(i=>({nodeID: i})))
}
function link(a,b) {
  aDAG.addEdges([{ source: { nodeID: a }, target: { nodeID: b } }]);
}
add(1,2,3,4,5)
link(1,2)
link(2,3)
link(1,4)
link(4,5)

const nodeIterator = aDAG.traverseBreadthFirstGenerator({
  startingNodeID: 1
});
let currentNode = nodeIterator.next();
let orderedNodes = [];
while (!currentNode.done) {
  orderedNodes.push(currentNode.value);
  currentNode = nodeIterator.next();
}
//console.log({orderedNodes})

export function derp() {}