import keyboard from 'keyboardjs'

export function bindkeys(onkey) {
  const lettersArray = Array.from(
    '`abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}\\;:\'"<>,./?'
  )
  keyboard.bind([...lettersArray, 'space', 'enter', 'escape'], pressed)

  function pressed(e) {
    const o = { key: e.key.toLowerCase() }
    onkey(o)
  }
}
