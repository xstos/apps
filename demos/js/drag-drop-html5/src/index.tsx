import './index.css';
import {store as createStore, watch} from 'hyperactiv/src/react'
import * as ReactDOM from "react-dom";
import {DndProvider, useDrag, useDrop} from "react-dnd";
import {HTML5Backend} from "react-dnd-html5-backend";

const state = createStore({
  items: ['a','b','c','d'],
})
const Render = watch(() =>
  state.items.map((item, i) => <DndDiv id={i}>{item}</DndDiv>))

function Provider(props) {
  return <DndProvider backend={HTML5Backend}>{props.children}</DndProvider>
}

function swapIndexes(arr, dropId, draggedId) {
  const old = arr[dropId]
  arr[dropId] = arr[draggedId]
  arr[draggedId] = old
}

function DndDiv(props) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: '1',
    item: {id: props.id},
    collect: (monitor) => {
      return ({
        isDragging: !!monitor.isDragging(),
      });
    }
  }))

  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: '1',
      drop: (item, monitor) => {
        let destId = props.id
        let srcId = item.id
        swapIndexes(state.items, destId, srcId);
      },
      canDrop: (item, monitor) => {
        return item.id !== props.id
      },
      collect: (monitor) => {
        return ({
          isOver: !!monitor.isOver(),
          canDrop: !!monitor.canDrop(),
        })
      }
    }),
    []
  )
  return <button
    ref={(el) => drag(drop(el))}
    style={{
      opacity: isDragging ? 0.5 : 1,
      cursor: 'move',
      minWidth: '6ch',
      minHeight: '6ch',
      border: '1px solid red',
      display: 'inline-block'
    }}
  >
    {props.children}
  </button>
}
const App = <Provider>
  <Render/>
</Provider>

ReactDOM.render(App,document.getElementById('root'))