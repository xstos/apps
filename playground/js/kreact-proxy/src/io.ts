//import keyboard from 'keyboardjs'
const lettersArray = Array.from(
  '`abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}\\;:\'"<>,./?'
)
export function bindkeys(onkey, shouldHandleCallback) {

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
    if (shouldHandleCallback) {
      const shouldHandle = shouldHandleCallback(event, foo)
      if (shouldHandle === false) return
    }
    pressed({ tag: 'io', key: foo })
  });
  //keyboard.bind('ctrl',(e)=>console.log(e))
  function pressed(e) {
    console.log(e)
    const o = { tag: "io",  key: e.key.toLowerCase() }
    onkey(o)
  }
  /*
  document.addEventListener('click', (event)=> {
    console.log('emitting click events');
  })

  document.addEventListener('dblclick',(event)=>{
    console.log('emitting double click events');
  } )

  document.addEventListener('contextmenu', (event)=>{
    console.log('emitting right click events');
  })

  document.addEventListener('mouseenter',(event)=> {
    console.log("mouse enter, hovering started")
  })

  document.addEventListener('mouseleave', (event)=> {
    console.log("hovering finished")
  })
  */
  return onkey
}
