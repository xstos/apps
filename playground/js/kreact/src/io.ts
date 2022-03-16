import keyboard from 'keyboardjs'

export function bindkeys(onkey) {
  const lettersArray = Array.from(
    '`abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}\\;:\'"<>,./?'
  )
  //keyboard.bind([...lettersArray, 'space', 'enter', 'escape', 'backspace', 'left', 'right', 'up', 'down', 'delete'], pressed)
  // keyboard.bind('ctrl + enter', ()=>{
  //   debugger
  // })
  document.addEventListener('keydown', event => {
    const key = event.key.toLowerCase()
    if (key==="control" || key==="alt" || key==="shift") return
    const mod = [event.ctrlKey && "ctrl", event.altKey && "alt", event.shiftKey && "shift"]
      .filter(v=>v)

    const foo = [...mod, key].join("+")

    pressed({ tag: 'io', key: foo })


  });
  //keyboard.bind('ctrl',(e)=>console.log(e))
  function pressed(e) {
    console.log(e)
    const o = { tag: "io",  key: e.key.toLowerCase() }
    onkey(o)
  }
}

