/*export function insertBefore(newChild: Text, referenceNode: Element | null) {
  referenceNode.parentElement.insertBefore(newChild, referenceNode)
}*/

export function toggleClass(el, cls) {
  if (el.classList.contains(cls)) {
    el.classList.remove(cls)
  } else {
    el.classList.add(cls)
  }
}
export function hasClass(el,cls) {
  return el.classList.contains(cls)
}


export function insertBefore(newNode: HTMLElement, existingNode: HTMLElement) {
  const parentNode = existingNode.parentNode
  if (!parentNode) return
  parentNode.insertBefore(newNode, existingNode)
}
export function insertAfter(newNode: HTMLElement, existingNode: HTMLElement) {
  const parentNode = existingNode.parentNode
  if (!parentNode) return
  parentNode.insertBefore(newNode, existingNode.nextSibling);
}

export function unmount(...els: HTMLElement[]) {
  els.forEach(el=>{
    if (!el.parentElement) return
    el.parentElement.removeChild(el)
  })
}