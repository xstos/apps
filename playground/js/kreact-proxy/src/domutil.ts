export function insertBefore(newChild: Text, referenceNode: Element | null) {
  referenceNode.parentElement.insertBefore(newChild, referenceNode)
}

export function toggleClass(el, cls) {
  if (el.classList.contains(cls)) {
    el.classList.remove(cls)
  } else {
    el.classList.add(cls)
  }
}