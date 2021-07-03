import keyboard from 'keyboardjs'

export function bindkeys(onkey) {
  const lettersArray = Array.from(
    '`abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}\\;:\'"<>,./?'
  )
  keyboard.bind([...lettersArray, 'space', 'enter', 'escape', 'backspace', 'left', 'right', 'up', 'down', 'delete'], pressed)

  function pressed(e) {
    const o = { key: e.key.toLowerCase() }
    onkey(o)
  }
}
