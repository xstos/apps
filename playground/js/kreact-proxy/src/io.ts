//import keyboard from 'keyboardjs'
const lettersArray = Array.from(
  '`abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}\\;:\'"<>,./?'
)
const prevDef = {
  ['ctrl+a']: 1,
  tab: 1
}
export function bindkeys(onkey) {

  //keyboard.bind([...lettersArray, 'space', 'enter', 'escape', 'backspace', 'left', 'right', 'up', 'down', 'delete'], pressed)
  // keyboard.bind('ctrl + enter', ()=>{
  //   debugger
  // })
  document.addEventListener('keydown', event => {
    const key = event.key.toLowerCase()

    if (key==="control" || key==="alt" || key==="shift") return
    const mod = [
      event.ctrlKey && "ctrl",
      event.altKey && "alt",
      event.shiftKey && "shift"]
      .filter(v=>v)

    const foo = [...mod, key].join("+")
    if (foo === "ctrl+c") return
    if (foo in prevDef) {
      event.preventDefault()
    }
    pressed({ tag: 'io', key: foo })
  });
  //keyboard.bind('ctrl',(e)=>console.log(e))
  function pressed(e) {
    console.log(e)
    const o = { tag: "io",  key: e.key.toLowerCase() }
    onkey(o)
  }
  return onkey
}
