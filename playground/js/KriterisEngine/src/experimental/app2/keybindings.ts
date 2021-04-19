import keyboard from 'keyboardjs'

export function bindkeys(machine) {
  const lettersArray = Array.from(
    '`abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}\\;:\'"<>,./?'
  )
  keyboard.bind([...lettersArray, 'space', 'enter', 'escape'], (e) => {
    const o = { key: e.key.toLowerCase() }
    console.log(o)
    machine.sendKey(o)
  })
}
