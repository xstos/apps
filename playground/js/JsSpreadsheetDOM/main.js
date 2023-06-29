import { reactive, html } from 'https://esm.sh/@arrow-js/core';
const {cellx, Cell} = window.cellx

const data = reactive({
    foo: 25,
})
let num = cellx(1);
let plusOne = cellx(() => num() + 1);
plusOne.on(Cell.EVENT_CHANGE, (evt) => {
    data.foo=evt.data.value
    console.log(JSON.stringify(evt.data)) // {"prevValue":2,"value":3}
})
num(2)

const appElement = document.getElementById('app');

const template = html`Hello <em>${()=>data.foo}</em>`

template(appElement)

















