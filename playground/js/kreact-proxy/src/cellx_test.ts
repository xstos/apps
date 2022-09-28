import {cellx, Cell} from "cellx"

let num = cellx(1);
let plusOne = cellx(() => num() + 1);
plusOne.on(Cell.EVENT_CHANGE, (evt) => {
  console.log(JSON.stringify(evt.data)) // {"prevValue":2,"value":3}
})
num(2)
export const cellx_stuff =2