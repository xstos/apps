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
export function setClass(el: HTMLElement,addRemove: boolean,cls: string) {
  if (addRemove) {
    el.classList.add(cls)
  } else {
    el.classList.remove(cls)
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
  els.filter(el=>el).forEach(el=>{
    if (!el.parentElement) return
    el.parentElement.removeChild(el)
  })
}
export function assignPropsStyle(propsStyle: Partial<CSSStyleDeclaration>, s: CSSStyleDeclaration) {
  Object.entries(propsStyle).forEach((e) => {
    const [k, v] = e
    // @ts-ignore
    s[k] = v
  })
}