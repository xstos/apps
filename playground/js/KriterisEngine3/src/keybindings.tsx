import keyboard from 'keyboardjs'
const charArray = '`abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}\\;:\'"<>,./?'.split('')
const bindings = [...charArray, 'space', 'enter', 'escape', 'backspace', 'left', 'right', 'up', 'down', 'delete']
export function onKeyPressed(onkey) {
  keyboard.bind(bindings, (e) => onkey(e.key))
}
