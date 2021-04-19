import keyboard from 'keyboardjs'

export function keyboardBindings(dispatch, getId) {
  keyboard.setContext('intellisense')
  keyboard.bind('`', (e) => {
    keyboard.setContext('editing')
    dispatch('menuClose', {
      key: 'Escape',
      value: { title: '', command: [''] },
    })
  })

  keyboard.setContext('editing')
  keyboard.bind('`', (e) => {
    keyboard.setContext('intellisense')
    dispatch('menu', { id: getId() })
  })
  const lettersArray = Array.from(
    'abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}\\;:\'"<>,./?'
  )
  keyboard.bind([...lettersArray, 'space', 'enter'], (e) => {
    const { key } = e
    const id = getId()
    dispatch('key', { key, id })
  })
  keyboard.bind(['left', 'right'], (e) => {
    const { key } = e
    dispatch('cursorMove', { key })
  })
  keyboard.bind(['delete', 'backspace'], (e) => {
    const { key } = e
    dispatch('cursorDelete', { key })
  })
}
