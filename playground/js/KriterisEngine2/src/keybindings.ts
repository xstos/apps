import keyboard from 'keyboardjs'
const lettersArray = Array.from(
    '`abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}\\;:\'"<>,./?'
)
const arr2 = [...lettersArray, 'space', 'enter', 'escape', 'backspace', 'left', 'right', 'up', 'down', 'delete']
export function bindkeys(onkey) {

  keyboard.bind(arr2, pressed)

  function pressed(e) {
    const o = { key: e.key.toLowerCase() }
    onkey(o)
  }
  return ()=>keyboard.unbind(arr2,pressed)
}
