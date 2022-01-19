import keyboard from 'keyboardjs'
import {toDateTime} from "./misc";
const lettersArray = '`abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}\\;:\'"<>,./?'.split('')
const arr2 = [...lettersArray, 'space', 'enter', 'escape', 'backspace', 'left', 'right', 'up', 'down', 'delete']
export function onkey(onkey) {
    keyboard.bind(arr2, pressed)

    function pressed(e) {
        const dt = toDateTime(new Date())
        const o = { key: e.key.toLowerCase(), dt }
        onkey(o)
    }
    return ()=>keyboard.unbind(arr2,pressed)
}
