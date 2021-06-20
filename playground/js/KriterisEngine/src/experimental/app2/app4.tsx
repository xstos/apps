import * as R from 'ramda'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

function measureText(fontFamily, fontSize, text) {
  const el = document.createElement('span')
  const s = el.style
  s.fontFamily = fontFamily
  s.fontSize = `${fontSize}px`
  el.textContent = text
  document.body.appendChild(el)
  const result = el.getBoundingClientRect()
  document.body.removeChild(el)
  return result
}
function makeArrow(x, y, z, hex) {
  const dir = new THREE.Vector3(x, y, z)
  dir.normalize()
  const origin = new THREE.Vector3(0, 0, 0)
  const length = 5

  return new THREE.ArrowHelper(dir, origin, length, hex)
}

function createTextureGeneratorCanvas(
  fontSize: number,
  fontFamily: string,
  size: DOMRect
) {
  const c = document.createElement('canvas')
  const s = c.style
  s.border = '1px solid black'
  s.position = 'absolute'
  s.fontSize = `${fontSize}px`
  s.fontFamily = fontFamily
  document.body.appendChild(c)
  const atlasText = 'RQ'
  c.width = atlasText.length * size.width
  c.height = size.height
  const ctx = c.getContext('2d')
  ctx.font = `${fontSize}px ${fontFamily}`
  ctx.fillStyle = '#FF0000'
  ctx.fillText(atlasText, 0, c.height * 0.75)
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'

  return c
}

function pushSquare(
  target,
  width: number,
  height: number,
  x: number,
  y: number,
  z: number
) {
  const V3 = THREE.Vector3
  target.push(
    new V3(x, y, z),
    new V3(x + width, y, z),
    new V3(x + width, y + height, z),

    new V3(x, y, z),
    new V3(x + width, y + height, z),
    new V3(x, y + height, z)
  )
}

export function App4() {
  const bodyStyle = document.body.style
  bodyStyle.margin = '0px'
  bodyStyle.padding = '0px'
  bodyStyle.width = '100vw'
  bodyStyle.height = '100vh'
  const fontSize = 64
  const fontFamily = 'Monospace'
  const size = measureText(fontFamily, fontSize, '█')

  document.getElementById('root').remove()

  const textureCanvas = createTextureGeneratorCanvas(fontSize, fontFamily, size)

  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setClearColor(0x333333)
  document.body.appendChild(renderer.domElement)

  const camera = new THREE.PerspectiveCamera(50, 1, 4, 40000)
  camera.position.z = 30
  camera.setFocalLength(35)

  window.onresize = function () {
    const rect = document.body.getBoundingClientRect()
    renderer.setSize(rect.width, rect.height)
    camera.aspect = rect.width / rect.height
    camera.updateProjectionMatrix()
  }
  window.onresize()

  const scene = new THREE.Scene()

  const tex = new THREE.Texture(textureCanvas)
  tex.needsUpdate = true

  const mat = new THREE.MeshBasicMaterial({ map: tex })
  mat.transparent = true

  const geom = new THREE.BufferGeometry()

  const str = 'h'
  //https://threejsfundamentals.org/threejs/lessons/threejs-custom-buffergeometry.html
  //https://stackoverflow.com/a/41387986/1618433

  const width = 1
  const height = 1
  const points = []
  const numLetters = 2
  function pushUvs(target, index, numTextures) {
    const delta = 1.0 / numTextures
    const number = index * delta
    const x1 = number
    const x2 = number + delta
    target.push(x1, 0.0, x2, 0.0, x2, 1.0, x1, 0.0, x2, 1.0, x1, 1.0)
  }
  const bound = 10
  const quad_uvs = []
  const stepper = sequence(0, n => ++n % bound)
  const stepper2 = sequence(0, n => ++n % bound)
  for (let i = 0; i < 100; i++) {
    pushSquare(
      points,
      width,
      height,
      stepper(),
      stepper2(),
      i * 0.0001+0.1
    )
    const letterIndex = isEven(i) ? 0 : 1
    pushUvs(quad_uvs, letterIndex, numLetters)
  }
  const uvs = new Float32Array(quad_uvs)
  geom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
  //geom.setAttribute('position', new THREE.BufferAttribute(verts, 3 ) )
  geom.setFromPoints(points)
  //geom.setDrawRange(0, 3 * 100*2 )
  //const mat2 = new THREE.LineBasicMaterial({ color: 0x444444 })
  const mesh = new THREE.Mesh(geom, mat)
  const top = new THREE.Object3D()
  top.add(mesh)
  const grid = new THREE.GridHelper(30, 30, 0x444444, 0x888888)
  grid.rotateX(Math.PI / 2)
  scene.add(camera)
  scene.add(top)
  scene.add(grid)
  scene.add(makeArrow(5, 0, 0, 0xff0000))
  scene.add(makeArrow(0, 5, 0, 0x00ff00))
  scene.add(makeArrow(0, 0, 5, 0x0000ff))

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.addEventListener('change', raf)
  //const worldDir = new THREE.Vector3()
  function animate() {
    //camera.getWorldDirection(worldDir)
    //console.log(camera.position, worldDir)

    renderer.render(scene, camera)
  }
  function raf() {
    requestAnimationFrame(animate, renderer.domElement)
  }
  raf()
}
function sequence(start, stepFunction) {
  let current = start
  return function moveNext() {
    const ret = current
    current = stepFunction(current)
    return ret
  }
}
function randBetween(start, end) {
  return Math.floor(Math.random() * (end - start) + start)
}
function isEven(value) {
  return value % 2 === 0
}
