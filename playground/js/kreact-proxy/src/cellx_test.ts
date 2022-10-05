import {cellx, Cell} from "cellx"
import {ObservableList} from "cellx-collections"

let num = cellx(1);
let plusOne = cellx(() => num() + 1);
plusOne.on(Cell.EVENT_CHANGE, (evt) => {
  console.log(JSON.stringify(evt.data)) // {"prevValue":2,"value":3}
})
num(2)

const ol = new ObservableList([1])
const mylist = cellx(()=>ol)

mylist.onChange((evt)=>{
  console.log('derp',evt)
})
ol.add(1)

export const cellx_stuff =2