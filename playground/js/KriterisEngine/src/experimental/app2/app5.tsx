import * as R from 'ramda'
//https://kitsunegames.com/post/development/2016/07/11/canvas3d-3d-rendering-in-javascript/
export function App5() {
  document.getElementById('root').remove()
  const { body } = document
  const bodyStyle = body.style
  bodyStyle.padding = '0px'
  bodyStyle.margin = '0px'
  const canvas = document.createElement('canvas')
  const canvasStyle = canvas.style
  canvasStyle.width = '100vw'
  canvasStyle.height = '100vh'
  canvasStyle.display = 'block'

  body.appendChild(canvas)

  window.onresize = function () {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
  window.onresize()

  // clear our canvas to opaque black
  const context = canvas.getContext('2d')
  context.fillStyle = 'red'
  context.fillRect(0, 0, canvas.width, canvas.height)

  const data = context.getImageData(0, 0, canvas.width, canvas.height)
  console.log(data)
  for (let index = 0; index < 300; index++) {
    const pixels = data.data
    pixels[index] = pixels[index + 1] = pixels[index + 2] = pixels[index + 3] = 128;
  }

  context.putImageData(data,0,0)
}
