export function insertBefore(newChild: Text, referenceNode: Element | null) {
  referenceNode.parentElement.insertBefore(newChild, referenceNode)
}